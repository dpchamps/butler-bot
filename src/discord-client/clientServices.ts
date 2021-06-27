import { Client } from "discord.js";
import { listenService } from "../services/listen-service/listen-service";
import { AppConfig } from "../config";
import { DbService } from "../services/db/db";

export const composeClient = async (
  discordClient: Client,
  config: AppConfig,
  dbService: DbService
) => {
  listenService(discordClient, config);
};
