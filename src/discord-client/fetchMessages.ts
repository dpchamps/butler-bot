import { Message } from "discord.js";
import compareAsc from "date-fns/compareAsc";
import { compareDesc } from "date-fns";

const maybeFilterAuthor = (message: Message, author?: string) =>
  typeof author === "undefined" || message.author.username === author;

const filterMessages = (author?: string) => (message: Message) =>
  !message.author.bot &&
  !message.content.startsWith("butler:") &&
  maybeFilterAuthor(message, author);

export const fetchMessages = async (
  message: Message | undefined,
  remaining: number,
  author?: string
): Promise<Message[]> => {
  if (!message) return [];
  const nextFetch = Math.min(remaining, 100);
  const nextRemaining = remaining - nextFetch;
  const channel = await message.client.channels.fetch("819655482956447807");
  if (!channel.isText()) return [];

  const messages = (
    await channel.messages.fetch({
      limit: nextFetch,
      before: message.id,
    })
  ).filter(filterMessages(author));

  if (nextRemaining > 0) {
    const next = await fetchMessages(messages.last(), nextRemaining, author);
    return [...messages.values(), ...next];
  }

  return [...messages.values()].sort((a, b) =>
    compareAsc(a.createdTimestamp, b.createdTimestamp)
  );
};

export const fetchMessagesByTime = async (
  message: Message | undefined,
  timestamp: number,
  author?: string
): Promise<Message[]> => {
  if (!message) return [];
  const channel = await message.client.channels.fetch("819655482956447807");
  if (!channel.isText()) return [];

  const messages = (
    await channel.messages.fetch({
      limit: 100,
      before: message.id,
    })
  ).filter(filterMessages(author));

  const sorted = [...messages.values()].sort((a, b) =>
    compareAsc(a.createdTimestamp, b.createdTimestamp)
  );

  if (timestamp < sorted[0].createdTimestamp) {
    const next = await fetchMessagesByTime(sorted[0], timestamp, author);
    return [...sorted, ...next];
  }

  return sorted.filter(({ createdTimestamp }) => createdTimestamp > timestamp);
};
