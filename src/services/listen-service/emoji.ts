import { DbService } from "../db/db";

export const emoji = async (dbService: DbService) => {
  const emojis = await dbService.emojiTracker.listEmojis();
  console.log(emojis);
};
