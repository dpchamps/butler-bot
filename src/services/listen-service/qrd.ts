import { Collection, Message, Channel } from "discord.js";
import { BotCommand } from "../../bot/parseCommand";
import {
  Option,
  orDefault,
  parseToNumber,
  tail,
  unimplemented,
} from "../../util";
import { deepApology, speak } from "../../bot/speak";
import subHours from "date-fns/subHours";
import compareAsc from "date-fns/compareAsc";
import compareDsc from "date-fns/compareDesc";

const { SummarizerManager } = require("node-summarizer");
const USAGE_MESSAGE = `I expected: \`butler: qrd. <number of messages>\``;

const searchError = () =>
  new Error(`I had a hard time finding messages in the channel.`);

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
    return validateValue(parseToNumber(orDefault(subcommand, "100")));
  } catch (e) {
    throw new Error(`${USAGE_MESSAGE}\n${e.message}`);
  }
};

const binarySearchMessages = (needle: Date, messages: Message[]): Message[] => {
  const pointer = Math.ceil(messages.length / 2);
  const middle = messages[pointer];

  if (!middle) {
    throw searchError();
  }

  if (compareAsc(needle, new Date(middle.createdTimestamp)) === 1) {
    return binarySearchMessages(needle, messages.slice(pointer));
  }

  return messages;
};

const fetchMessagesUntilSatisfied = async (
  needle: Date,
  start: Message,
  messages?: Collection<string, Message>
): Promise<Message[]> => {
  const lastMessages = (
    await start.channel.messages.fetch({
      limit: 10,
      before: start.id,
    })
  )
    .sort((a, b) =>
      compareDsc(new Date(a.createdTimestamp), new Date(b.createdTimestamp))
    )
    .filter((msg) => !msg.author.bot);
  const lastMessage = lastMessages.last();
  const nextMessages = messages ? messages.concat(lastMessages) : lastMessages;
  const lastMessageTimestamp = new Date(start.createdTimestamp);

  if (!lastMessage) {
    throw searchError();
  }

  if (compareAsc(needle, lastMessageTimestamp) === -1) {
    return fetchMessagesUntilSatisfied(needle, lastMessage, nextMessages);
  }

  return binarySearchMessages(needle, [...nextMessages.values()]);
};

const summarizeMessage = async (messages: Message[]) => {
  const corpus = messages
    .map((msg) => `${msg.content.split("\n").filter(Boolean).join(".")}.`)
    .join("\n");

  const summarizer = new SummarizerManager(corpus, 5);

  const trSummary = await summarizer
    .getSummaryByRank()
    .then(({ summary }: any) => summary);

  return (trSummary as string).split("\n").filter(Boolean).join("\n");
};

const fetchMessages = async (
  message: Message | undefined,
  remaining: number
): Promise<Message[]> => {
  if (!message) return [];
  const nextFetch = Math.min(remaining, 100);
  const nextRemaining = remaining - nextFetch;
  console.log({ nextFetch });

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

  return [...messages.values()];
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
