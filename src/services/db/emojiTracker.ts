import { AppConfig } from "../../config";
import { Client, Result } from "ts-postgres";

const emojiCounter = ({
  emojiId,
  increment,
}: {
  emojiId: string;
  increment: boolean;
}) => `
INSERT INTO emojis(emoji_id, used)
VALUES(${emojiId}, ${1})
ON CONFLICT(id) DO
UPDATE SET used = used ${increment ? "+" : "-"} 1`;

const listEmojis = () => `SELECT emoji_id, used FROM emojis`;

const buildEmojiHistogram = (result: Result) =>
  [...result].reduce(
    (chart, row) => ({
      [String(row.get("emoji_id"))]: String(row.get("used")),
      ...chart,
    }),
    {} as Record<string, string>
  );

export const emojiTracker = (config: AppConfig, client: Client) => {
  return {
    increment: (emojiId: string) =>
      client.query(emojiCounter({ emojiId, increment: true })),
    decrement: (emojiId: string) =>
      client.query(emojiCounter({ emojiId, increment: false })),
    listEmojis: () => client.query(listEmojis()).then(buildEmojiHistogram),
  };
};
