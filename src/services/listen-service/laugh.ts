import { Message } from "discord.js";
import { deepApology } from "../../bot/speak";
import { getRandom, STATIC_DIR } from "../../util";
import { promises as fs } from "fs";
import { join } from "path";

const getImageOfGirlsLaughing = () =>
  fs
    .readdir(join(STATIC_DIR, "girls-laughing"))
    .then(getRandom)
    .then((x) => join(STATIC_DIR, "girls-laughing", x));

export const laugh = async (message: Message) => {
  if (!message.reference || !message.reference.messageID) {
    return message.channel.send(
      deepApology(`I'm not quite sure whom it is you'd like me to laugh at.`)
    );
  }

  try{
    const [toLaughAt, girlsLaughingImage] = await Promise.all([
      message.channel.messages.fetch(message.reference.messageID),
      getImageOfGirlsLaughing(),
    ]);

    return message.channel.send({
      content: `${toLaughAt.author}, They're laughing at you.`,
      files: [girlsLaughingImage],
    });

  } catch {

    return message.channel.send(
        deepApology(`Something went wrong while I started laughing.`)
    );

  }
};
