import { Client } from "discord.js";
import { AppConfig } from "../config";
import { sleep } from "../util";
import { composeClient } from "./clientServices";

const clientReady = (client: Client) =>
  Promise.race([
    sleep(1000),
    new Promise<void>((res) => client.on("ready", () => res())),
  ]).catch(() => {
    console.error(`Failed to start client, timed out after one second`);
    throw Error();
  });

export const startClient = async (config: AppConfig) => {
  const client = new Client();

  console.log("Logging in...");
  await client.login(config.DISCORD_BOT_TOKEN);
  console.info("All set, the bot's up!");
  await clientReady(client);
  await composeClient(client, config);

  return () => client.destroy();
};
