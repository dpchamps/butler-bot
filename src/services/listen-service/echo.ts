import { Message } from "discord.js";
import { BotCommand } from "../../bot/parseCommand";
import { speak } from "../../bot/speak";
import { orDefault } from "../../util";

const extractEchoContent = (message: Message) =>
  message.reference?.messageID
    ? message.channel.messages
        .fetch(message.reference.messageID)
        .then(({ content }) => content)
    : Promise.resolve();

export const echo = (message: Message, { content }: BotCommand) =>
  extractEchoContent(message)
    .then((x) => orDefault(x, content.join(". ")))
    .then((echoContent) =>
      message.channel.send(
        speak(`I will now repeat what you asked: "${echoContent}"`)
      )
    );
