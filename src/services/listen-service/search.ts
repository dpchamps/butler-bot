import { Message } from "discord.js";
import { deepApology, speak } from "../../bot/speak";
import { BotCommand } from "../../bot/parseCommand";
import { URL, URLSearchParams } from "url";

const getUrl = (engine: "google" | "bing", phrase: string) => {
  const url = new URL(`https://${engine}.com/search`);
  const params = new URLSearchParams({
    q: phrase,
  });

  url.search = params.toString();

  return url.toString();
};

export const search = async (
  message: Message,
  searchEngine: "google" | "bing",
  command: BotCommand
) => {
  const { searchTerm, author } =
    message.reference && message.reference.messageID
      ? await message.channel.messages
          .fetch(message.reference.messageID)
          .then((x) => ({ searchTerm: x.content, author: x.author.toString() }))
      : { searchTerm: command.content[0], author: undefined };

  if (!searchTerm) {
    return message.channel.send(
      deepApology("Couldn't quite make out what I'd like to search for.")
    );
  }

  const url = getUrl(searchEngine, searchTerm);

  return message.channel.send(
    speak(`${author ? author + " " : ""}You may find this useful: ${url}.`)
  );
};
