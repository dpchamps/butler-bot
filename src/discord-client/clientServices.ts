import {Client} from "discord.js";
import {listenService} from "../services/listen-service/listen-service";
import {AppConfig} from "../config";

export const composeClient = async (client: Client, config: AppConfig) => {
    listenService(client, config);
};
