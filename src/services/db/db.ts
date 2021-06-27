import { Client } from "ts-postgres";
import { AppConfig } from "../../config";
import { Awaited } from "../../util";
import { emojiTracker } from "./emojiTracker";

export type DbService = Awaited<ReturnType<typeof createDbService>>;

export const createDbService = async (config: AppConfig, client: Client) => {
  return {
    emojiTracker: emojiTracker(config, client),
  };
};
