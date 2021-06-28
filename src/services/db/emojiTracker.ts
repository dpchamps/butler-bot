import { AppConfig } from "../../config";
import { Client, Result } from "ts-postgres";

const addEmoji = (emojiId: string, serverId: string, messageId: string) =>
    `INSERT INTO emojis(emoji_id, server_id, message_id)
     VALUES ('${emojiId}', '${serverId}', '${messageId}')`;

const removeEmoji = (messageId: string) =>
    `DELETE FROM emojis WHERE message_id='${messageId}'`;

const listEmojis = (serverId: string) =>
    `
    SELECT emoji_id, COUNT(server_id) as count 
    FROM emojis
    WHERE server_id='${serverId}'
    GROUP BY emoji_id
    `;

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
    add: (emojiId: string, serverId: string, messageId: string) =>
      client.query(addEmoji(emojiId, serverId, messageId)),
    remove: (messageId: string) =>
      client.query(removeEmoji(messageId)),
    listEmojis: (serverId: string) =>
        client.query(listEmojis(serverId)).then(buildEmojiHistogram),
  };
};
