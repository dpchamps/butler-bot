import { Client } from "discord.js";
import { AppConfig } from "../config";
import { timeout } from "../util";
import { composeClient } from "./clientServices";

const clientReady = (client: Client) =>
  timeout(() => new Promise<void>((res) => client.on("ready", res)), 1000);

export const startClient = async (config: AppConfig) => {
  const client = new Client();

  console.log("Logging in...");

  await client.login(config.DISCORD_BOT_TOKEN);
  await clientReady(client);
  await composeClient(client, config);

  console.info("All set, the bot's up!");

  return () => client.destroy();
};
