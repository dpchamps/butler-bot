import { DbService } from "../db/db";
import {GuildEmojiManager, Message} from "discord.js";
import {deepApology, speak} from "../../bot/speak";
import {exists} from "../../util";


const formatEmojiHistogram = (hist: Record<string, string>, emojis: GuildEmojiManager) =>
    Object
        .entries(hist)
        .map(([name, count]) => [emojis.cache.find(x => x.id === name), Number(count)] as const)
        .filter(([name]) => exists(name))
        .sort(([, countA], [, countB]) => countB-countA)
        .reduce(
            (block, [name, count]) => `${block}\n\t ${name} : ${count}`,
            ""
        );

export const emoji = async (message: Message, dbService: DbService) => {
  const guild = message.guild;

  if(!guild){
    return message.channel.send(deepApology("Somehow could not identify a server related to this comment."))
  }

  return dbService.emojiTracker.listEmojis(guild.id, message.id)
      .then(x => formatEmojiHistogram(x, guild.emojis))
      .then(x => speak(`Emoji reactions over the last week: ${x}`))
      .then(content => message.channel.send(content))
};
