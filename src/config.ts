import {
  Record,
  String,
  Number,
  Static,
  Union,
  Literal,
  Boolean,
  Array,
} from "runtypes";
import { config } from "dotenv";
import { join } from "path";

const AppConfig = Record({
  DISCORD_APPLICATION_ID: String,
  DISCORD_CLIENT_ID: String,
  DISCORD_CLIENT_SECRET: String,
  DISCORD_BOT_TOKEN: String,
  IMGFLIP_USERNAME: String,
  IMGFLIP_PASSWORD: String,
  DEBUG: Boolean,
  DEBUG_CHANNELS: Array(String),
  OPEN_AI_KEY: String,
});

export type AppConfig = ReturnType<typeof getConfig>;

export const getConfig = () => {
  config({ path: join(process.cwd(), `.${process.env.NODE_ENV}.env`) });

  const {
    DISCORD_APPLICATION_ID,
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_BOT_TOKEN,
    IMGFLIP_USERNAME,
    IMGFLIP_PASSWORD,
    DEBUG,
    DEBUG_CHANNELS,
    OPEN_AI_KEY,
  } = process.env;

  return AppConfig.check({
    DISCORD_APPLICATION_ID,
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_BOT_TOKEN,
    IMGFLIP_USERNAME,
    IMGFLIP_PASSWORD,
    OPEN_AI_KEY,
    DEBUG: DEBUG === "1",
    DEBUG_CHANNELS:
      typeof DEBUG_CHANNELS === "string"
        ? DEBUG_CHANNELS.split(",")
        : undefined,
  });
};
