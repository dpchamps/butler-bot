import { Message } from "discord.js";
import { deepApology, speak } from "../../bot/speak";
import { getRandom, mockingCase } from "../../util";
import { promises as fs } from "fs";
import { join, resolve } from "path";

const STATIC_DIR = join(
  __dirname,
  "..",
  "..",
  "..",
  "static",
  "girls-laughing"
);
const getImageOfGirlsLaughing = () =>
  fs
    .readdir(STATIC_DIR)
    .then(getRandom)
    .then((x) => join(STATIC_DIR, x));

export const laugh = async (message: Message) => {
  if (!message.reference || !message.reference.messageID) {
    return message.channel.send(
      deepApology(`I'm not quite sure whom it is you'd like me to laugh at.`)
    );
  }
  const [toLaughAt, girlsLaughingImage] = await Promise.all([
    message.channel.messages.fetch(message.reference.messageID),
    getImageOfGirlsLaughing(),
  ]);

  if (!toLaughAt) {
    await message.channel.send(
      deepApology(`Something went wrong while I started laughing.`)
    );
  }

  return message.channel.send({
    content: `${toLaughAt.author}, They're laughing at you.`,
    files: [girlsLaughingImage],
  });
};
