import { Client } from "discord.js";
import { listenService } from "../services/listen-service/listen-service";
import { AppConfig } from "../config";
import { DbService } from "../services/db/db";
import {emojiService} from "../services/emoji-service/emojiService";

export const composeClient = async (
  discordClient: Client,
  config: AppConfig,
  dbService: DbService
) => {
  listenService(discordClient, config, dbService);
  emojiService(discordClient, config, dbService);
};
