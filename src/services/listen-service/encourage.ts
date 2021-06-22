import { Message } from "discord.js";
import { getRandom } from "../../util";
import { deepApology } from "../../bot/speak";

const getAuthor = (message: Message) =>
  message.reference && message.reference.messageID
    ? message.channel.messages
        .fetch(message.reference.messageID)
        .then(({ author }) => author)
    : Promise.resolve(message.author);

const handleError = (message: Message) => (e: Error) => {
  console.error(`[encourage]\n${e.message}`);
  return message.channel.send(
    deepApology(`Something went wrong while I was trying to encourage`)
  );
};

const wordsOfEncouragement = [
  `you dropped your crown, king: :crown:`,
  `you got this bro, I promise.`,
  `you are quite a based individual.`,
];

export const encourage = async (message: Message) =>
  getAuthor(message)
    .then((author) => ({
      author,
      content: getRandom(wordsOfEncouragement),
    }))
    .then(({ author, content }) =>
      message.channel.send(`${author}, ${content}`)
    )
    .catch(handleError(message));
