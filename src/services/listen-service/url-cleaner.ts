import { TidyURL } from "tidy-url";
import { Message } from "discord.js";
import { AppConfig } from "../../config";
import extractUrls from "extract-urls";
import { speak } from "../../bot/speak";
import { IRule } from "tidy-url/lib/interface";

TidyURL.rules.push({
  name: "buyatoyota.com",
  match: /www.buyatoyota.com/,
  match_href: false,
  rules: [
    "keyword",
    "ActivityID",
    "usercookie",
    "retargeting",
    "v",
    "cv",
    "sz",
    "siteid",
    "filters",
  ],
  replace: [],
  redirect: "",
  amp: null,
  decode: null,
  rev: false,
} as unknown as IRule);

export const maybeRespondWithCleanUrl = async (
  message: Message,
  config: AppConfig
) => {
  const urls = extractUrls(message.content);

  if (!urls || !urls.length || message.author.bot) return;

  const sanitizedUrls = urls
    .filter((url) => TidyURL.validate(url))
    .map((url) => TidyURL.clean(url))
    .filter((data) => data.info.reduction > 0)
    .map(({ url }) => url);

  if (!sanitizedUrls.length) return;

  await message.channel.send({
    content: speak(`${sanitizedUrls.map((x) => `- ${x}`).join("\n")}`),
    reply: message,
  });
};
