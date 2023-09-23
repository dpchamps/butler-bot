import { Client, Message } from "discord.js";
import { parseCommand } from "../../bot/parseCommand";
import { unreachable } from "../../util";
import { echo } from "./echo";
import { meme } from "./meme";
import { AppConfig } from "../../config";
import { mock } from "./mock";
import { qrd } from "./qrd";
import { laugh } from "./laugh";
import { search } from "./search";
import { sermon } from "./sermon";
import { encourage } from "./encourage";
import { vibecheck } from "./vibecheck";
import { orderUp } from "./order-up";
import { maybeRespondWithCleanUrl } from "./url-cleaner";

const maybeDoCommand = async (message: Message, config: AppConfig) => {
  const command = parseCommand(message.content);

  if (!command.isValid) return false;

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

    case "sermon": {
      await sermon(message);
      break;
    }

    case "encourage": {
      await encourage(message);
      break;
    }

    case "vibecheck": {
      await vibecheck(message, command);
      break;
    }

    case "order up": {
      await orderUp(message, command);
      break;
    }

    default:
      unreachable(command.type);
  }

  return true;
};

export const listenService = (client: Client, config: AppConfig) => {
  client.on("message", async (message) => {
    if (config.DEBUG && !config.DEBUG_CHANNELS.includes(message.channel.id))
      return;

    try {
      const didCommand = await maybeDoCommand(message, config);
      if (!didCommand) {
        await maybeRespondWithCleanUrl(message, config);
      }
    } catch (e) {
      console.error(`Something bad happened, and it went unnoticed...`, e);
    }
  });
};
