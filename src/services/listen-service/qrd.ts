import { Collection, Message } from "discord.js";
import { BotCommand } from "../../bot/parseCommand";
import { Option, orDefault, parseToNumber } from "../../util";
import { deepApology, speak } from "../../bot/speak";
import compareAsc from "date-fns/compareAsc";
const openai = require('openai');

openai.apiKey = 'your-openai-api-key';

const USAGE_MESSAGE = `I expected: \`butler: qrd. <number of messages>\``;

const validateValue = (value: number) => {
  if (value < 10 || value > 200) {
    throw new Error(
      `Can only run the qrd between 10 and 200 messages. One would be _wise_ to follow the chat more closely.`
    );
  }
  return value;
};

const parseQrdSubCommand = (subcommand: Option<string>) => {
  try {
    return validateValue(parseToNumber(orDefault(subcommand, "200")));
  } catch (e) {
    throw new Error(`${USAGE_MESSAGE}\n${e.message}`);
  }
};

const normalizeMessagesForCorpus = (messages: { content: string, attachments: string[] }[]) =>
  messages
    .flatMap(({ content }) =>
      content
        .split("\n")
        .filter(Boolean)
        .map((x) => `${x}`)
    )
    .map((x) => x.trim())
    .map((x) => (!x.match(/([?.!])$/) ? `${x}.` : x))
    .join("\n");

const buildAuthorFrequencyHistogram = (messages: Message[]) =>
  messages.reduce(
    (histogram, message) => ({
      ...histogram,
      [message.author.username]: histogram[message.author.username]
        ? histogram[message.author.username] + 1
        : 1,
    }),
    {} as Record<string, number>
  );

const topContributors = (n: number, histogram: Record<string, number>) =>
  Object.entries(histogram)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);

const lineLength = (ll: number) => (str: string) =>
  str.length > ll ? `${str.substring(0, ll)} ...` : str;

const processImages = async (imageUrls: string[]) => {
  // For simplicity, this function just returns image URLs.
  // You can enhance it to use an image processing API like Google Vision API if needed.
  return imageUrls.map(url => `Image URL: ${url}`);
};

const summarizeMessage = async (messageData: { content: string, attachments: string[] }[]) => {
  const textCorpus = normalizeMessagesForCorpus(messageData);
  const imageUrls = messageData.flatMap(msg => msg.attachments);

  const imageDescriptions = await processImages(imageUrls);
  const combinedContent = `${textCorpus}\n\nImage Descriptions:\n${imageDescriptions.join('\n')}`;

  const response = await openai.Completion.create({
    engine: 'gpt-4o',
    prompt: `Summarize the following content:\n\n${combinedContent}`,
    max_tokens: 300,
  });

  const trSummary = response.choices[0].text.trim();

  const topAuthors = topContributors(
    4,
    buildAuthorFrequencyHistogram(messageData)
  );

  return `Top posters: \n${topAuthors
    .map(([author, posts]) => `\`${author}\`, with ${posts} posts`)
    .join('\n')}\nSummary: \n${trSummary}`;
};

const fetchMessages = async (message: Message | undefined, remaining: number): Promise<{ content: string, attachments: string[] }[]> => {
  if (!message) return [];
  const nextFetch = Math.min(remaining, 100);
  const nextRemaining = remaining - nextFetch;

  const messages = (
    await message.channel.messages.fetch({
      limit: nextFetch,
      before: message.id,
    })
  ).filter(x => !x.author.bot && !x.content.startsWith("butler:"));

  const messageData = messages.map(msg => ({
    content: msg.content,
    attachments: msg.attachments.map(att => att.url).filter(url => url.endsWith('.jpg') || url.endsWith('.png'))
  }));

  if (nextRemaining > 0) {
    const nextMessages = await fetchMessages(messages.last(), nextRemaining);
    return [...messageData, ...nextMessages];
  }

  return messageData;
};

export const qrd = async (message: Message, { content }: BotCommand) => {
  try {
    const limit = parseQrdSubCommand(content[0]);
    const messageData = await fetchMessages(message, limit);
    const summary = await summarizeMessage(messageData);

    await message.channel.send({
      content: speak(
        `Your qrd, as requested of the last ${limit} messages:\n${summary}`
      ),
      reply: message.author,
    });
  } catch (e) {
    console.error(e);
    await message.channel.send(deepApology(e.message));
  }
};
