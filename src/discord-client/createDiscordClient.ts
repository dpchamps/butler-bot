import { Client } from "discord.js";
import { AppConfig } from "../config";
import { Awaited, timeout } from "../util";
import { composeClient } from "./clientServices";
import { createDbService, DbService } from "../services/db/db";
import { createDbClient } from "../services/db/create-db-client";

const clientReady = (client: Client) =>
  timeout(() => new Promise<void>((res) => client.on("ready", res)), 1000);

export const createDiscordClient = async (
  config: AppConfig,
  dbService: DbService
) => {
  const client = new Client();

  console.log("Logging in...");

  await client.login(config.DISCORD_BOT_TOKEN);
  await clientReady(client);
  await composeClient(client, config, dbService);

  console.info("All set, the bot's up!");

  return () => {
    client.destroy();
  };
};
