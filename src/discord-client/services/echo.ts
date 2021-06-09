import {Client} from "discord.js";

export const echoService = (client: Client) => {
    client.on('message', (message) => {
        if(message.content.startsWith("[echo]") && !message.author.bot){

            message.channel.send(
                `At your wish, of course, indubitably:
                
                You said: ${message.content.replace(`[echo]`, '')}`
            );

        }
    });
};
