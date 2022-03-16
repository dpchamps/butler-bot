import { Message } from "discord.js";
import { BotCommand } from "../../bot/parseCommand";
import { speak } from "../../bot/speak";
import { orDefault, textIf } from "../../util";
import { getAuthorFromReference } from "../../discord-client/message-utils";

const nothingBurger = "<nothing_burger:950100007913136169>";
const bell = ":bellhop:";

const getAuthorFromMessage = (message: Message) =>
  message.reference?.messageID
    ? getAuthorFromReference(
        message.channel.messages,
        message.reference.messageID
      )
    : Promise.resolve();

export const orderUp = (message: Message, _c: BotCommand) =>
  getAuthorFromMessage(message).then(
    (author) =>
      `${author}${textIf(author, ": ")}${[bell, bell, bell, nothingBurger].join(
        " "
      )}`
  );
