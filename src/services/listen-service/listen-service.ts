import { Client, Message } from "discord.js";
import { parseCommand } from "../../bot/parseCommand";
import { unreachable } from "../../util";
import { echo } from "./echo";
import { meme } from "./meme";
import { AppConfig } from "../../config";
import { mock } from "./mock";
import { qrd } from "./qrd";
import { laugh } from "./laugh";
import {search} from "./search";
import {sermon} from "./sermon";

const maybeDoCommand = async (message: Message, config: AppConfig) => {
  const command = parseCommand(message.content);

  if (!command.isValid) return;

  switch (command.type) {
    case "echo": {
      await echo(message, command);
      break;
    }

    case "invalid": {
      await message.channel.send(
        `I'm terribly sorry, but I don't know how to "${command.invalidCommand}".`
      );
      break;
    }

    case "meme": {
      await meme(message, command, config);
      break;
    }

    case "mock": {
      await mock(message);
      break;
    }

    case "qrd": {
      await qrd(message, command);
      break;
    }

    case "laugh": {
      await laugh(message);
      break;
    }

    case "bing":
    case "google": {
      await search(message, command.type, command);
      break;
    }

    case "sermon":{
      await sermon(message);
      break
    }
    default:
      unreachable(command.type);
  }
};

export const listenService = (client: Client, config: AppConfig) => {
  client.on("message", async (message) => {
    if (config.DEBUG && !config.DEBUG_CHANNELS.includes(message.channel.id))
      return;

    try {
      await maybeDoCommand(message, config);
    } catch (e) {
      console.error(`Something bad happened, and it went unnoticed...`, e);
    }
  });
};
