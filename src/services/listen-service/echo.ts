import { Message } from "discord.js";
import { BotCommand } from "../../bot/parseCommand";
import { speak } from "../../bot/speak";

export const echo = (message: Message, { content }: BotCommand) =>
  message.channel.send(
    speak(`I will now repeat what you asked: "${content.join(". ")}"`)
  );
