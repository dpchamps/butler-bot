import { Collection, Message, Channel } from "discord.js";
import { BotCommand } from "../../bot/parseCommand";
import { Option, orDefault, parseToNumber } from "../../util";
import { deepApology, speak } from "../../bot/speak";
import compareAsc from "date-fns/compareAsc";

const { SummarizerManager } = require("node-summarizer");
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

const normalizeMessagesForCorpus = (messages: Message[]) =>
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

const summarizeMessage = async (messages: Message[]) => {
  const corpus = normalizeMessagesForCorpus(messages);
  const topAuthors = topContributors(
    4,
    buildAuthorFrequencyHistogram(messages)
  );

  const summarizer = new SummarizerManager(corpus, 8);

  const trSummary = await summarizer
    .getSummaryByRank()
    .then(({ summary }: any) => summary);

  const normalizedSummary: Array<string> = [
    ...(new Set(trSummary.split(/[?.!]/gi)) as unknown as string[]),
  ].filter(Boolean);

  return `Top posters: \n${topAuthors
    .map(([author, posts]) => `\`${author}\`, with ${posts} posts`)
    .join("\n")}\nSummary: \n${normalizedSummary
    .map((x: string) => `\t - ${lineLength(300)(x)}`)
    .join("\n")}`;
};

const fetchMessages = async (
  message: Message | undefined,
  remaining: number
): Promise<Message[]> => {
  if (!message) return [];
  const nextFetch = Math.min(remaining, 100);
  const nextRemaining = remaining - nextFetch;
  // if(!channel.isText()) {
  //   throw new Error()
  // }

  const messages = (
    await message.channel.messages.fetch({
      limit: nextFetch,
      before: message.id,
    })
  ).filter((x) => !x.author.bot && !x.content.startsWith("butler:"));

  if (nextRemaining > 0) {
    const next = await fetchMessages(messages.last(), nextRemaining);
    return [...messages.values(), ...next];
  }

  return [...messages.values()].sort((a, b) =>
    compareAsc(a.createdTimestamp, b.createdTimestamp)
  );
};

export const qrd = async (message: Message, { content }: BotCommand) => {
  try {
    const limit = parseQrdSubCommand(content[0]);
    const messages = await fetchMessages(message, limit);
    const summary = await summarizeMessage(messages);

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
