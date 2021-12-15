import { BotCommand } from "../../bot/parseCommand";
import { Message } from "discord.js";
import { fetchMessagesByTime } from "../../discord-client/fetchMessages";
import Sentiment from "sentiment";
import { subHours } from "date-fns";
import { deepApology, speak } from "../../bot/speak";
import { Option, orDefault, parseToNumber } from "../../util";

const sum = (total: number, el: number) => total + el;

const roundToTwo = (num: number) => Math.round(num * 100) / 100;

const getOutputForAverageVibes = (avg: number) => {
  const rounded = Math.round(avg);
  if (rounded < 0) return `The vibes are _not great_  (${avg})`;
  if (rounded === 0) return `We're barely vibing right now (${avg})`;
  return `We're generally <:vibing:834626353181622312> (${avg})`;
};

const avgByUsername = (
  sentiments: { sentiment: Sentiment.AnalysisResult; username: string }[]
) => {
  const pooled = sentiments.reduce(
    (acc, { sentiment: { score }, username }) => {
      if (acc[username]) {
        acc[username].push(score);
      } else {
        acc[username] = [score];
      }

      return acc;
    },
    {} as Record<string, number[]>
  );

  return Object.entries(pooled).reduce(
    (acc, [username, scores]) => ({
      ...acc,
      [username]: scores.reduce(sum, 0) / scores.length,
    }),
    {} as Record<string, number>
  );
};

const getVibeBreakdown = (
  sentiments: { sentiment: Sentiment.AnalysisResult; username: string }[]
) => {
  return Object.entries(avgByUsername(sentiments))
    .sort((a, b) => b[1] - a[1])
    .reduce((output, [username, sentiment]) => {
      output += `${username}: ${
        sentiment < 0
          ? "<:alexa:842196489824108544>"
          : "<:vibing:834626353181622312>"
      } (${roundToTwo(sentiment)})\n`;

      return output;
    }, "");
};

const parseSubCommand = (subcommand: Option<string>) => {
  try {
    return parseToNumber(orDefault(subcommand, "1"));
  } catch (e) {
    throw new Error(`That's not a number\n${e.message}`);
  }
};

export const vibecheck = async (message: Message, { content }: BotCommand) => {
  try {
    const sentiment = new Sentiment();
    const hours = Math.max(1, Math.min(parseSubCommand(content[0]), 24));
    const sentiments = await fetchMessagesByTime(
      message,
      subHours(message.createdTimestamp, hours).getTime()
    ).then((messages) =>
      messages.map(({ content, author: { username } }) => ({
        sentiment: sentiment.analyze(content),
        username,
      }))
    );

    const averageVibes =
      sentiments.map(({ sentiment }) => sentiment.score).reduce(sum, 0) /
      sentiments.length;

    return message.channel.send(
      speak(
        `Here's the vibecheck for the last ${hours} hours: ${getOutputForAverageVibes(
          roundToTwo(averageVibes)
        )}.\n\n${getVibeBreakdown(sentiments)}`
      )
    );
  } catch (e) {
    await message.channel.send(deepApology(e.message));
  }
};
