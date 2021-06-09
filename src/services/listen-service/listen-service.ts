import {Client, Message} from "discord.js";
import {parseCommand} from "../../bot/parseCommand";
import {unreachable} from "../../util";
import {echo} from "./echo";
import {meme} from "./meme";
import {AppConfig} from "../../config";

const maybeDoCommand = (message: Message, config: AppConfig) => {
    const command = parseCommand(message.content);

    if(!command.isValid) return;

    switch (command.type) {
        case "echo": {
            echo(message, command);
            break;
        }

        case 'invalid': {
            message.channel.send(`I'm terribly sorry, but I don't know how to "${command.invalidCommand}".`);
            break;
        }

        case 'meme': {
            meme(message, command, config);
            break;
        }

        default: unreachable();
    }
};

export const listenService = (client: Client, config: AppConfig) => {
    client.on('message', (message) => {
       maybeDoCommand(message, config);
    });
};
