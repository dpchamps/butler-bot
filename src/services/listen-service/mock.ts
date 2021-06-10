import {Message} from "discord.js";


export const mock = (message: Message) => {
   console.log(JSON.stringify(message, null, 2));
};
