import {Client} from "discord.js";
import {AppConfig} from "../../config";
import {DbService} from "../db/db";

export const emojiService = (  client: Client,
                               config: AppConfig,
                               dbService: DbService) => {

    client.on("messageReactionAdd", ({emoji, message}) => {
        if(!emoji.id || !message.guild) return;

        dbService.emojiTracker.increment(emoji.id, message.guild.id);
    });

    client.on("messageReactionRemove", ({emoji, message}) => {
        if(!emoji.id || !message.guild) return;

        dbService.emojiTracker.decrement(emoji.id, message.guild.id);
    });

};
