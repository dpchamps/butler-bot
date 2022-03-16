import { Message, MessageManager } from "discord.js";

export const fetchMessage = (manager: MessageManager, messageId: string) =>
  manager.fetch(messageId);

export const getAuthorFromReference = (
  manager: MessageManager,
  messageId: string
) => fetchMessage(manager, messageId).then(({ author }) => author);
