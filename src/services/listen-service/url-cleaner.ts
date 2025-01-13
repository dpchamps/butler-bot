import { TidyURL } from "tidy-url";
import { Message } from "discord.js";
import { AppConfig } from "../../config";
import extractUrls from "extract-urls";
import { speak } from "../../bot/speak";
import { IData, IRule } from "tidy-url/lib/interface";
import { exists } from "../../util";
import fetch from "node-fetch";

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

TidyURL.rules.push({
  name: "walmart.com",
  match: /www.walmart.com/,
  match_href: false,
  rules: [
    "wmlspartner",
    "selectedSellerId",
    "wl13",
    "adid",
    "wmlspartner",
    "wl0",
    "wl1",
    "wl2",
    "wl3",
    "wl4",
    "wl5",
    "wl6",
    "wl7",
    "wl8",
    "wl9",
    "wl10",
    "wl11",
    "wl12",
    "wl13",
    "veh",
    "gclsrc",
    "adid",
    "wl0",
    "wl1",
    "wl2",
    "wl3",
    "wl4",
    "wl5",
    "wl6",
    "wl7",
    "wl8",
    "wl9",
    "wl10",
    "wl11",
    "wl12",
    "veh",
    "gclid",
  ],
  replace: [],
  redirect: "",
  amp: null,
  decode: null,
  rev: false,
} as unknown as IRule);

type CleanResult =
  | {
      type: "tidy";
      data: IData;
    }
  | {
      type: "degoogle";
      data?: string;
    };

const extractRedirect = async (url: string) => {
  try {
    const response = await fetch(url, {
      redirect: "manual",
      headers: {
        "user-agent": "fuck-off/google",
      },
    });

    if (response.status >= 300 && response.status < 400) {
      return response.headers.get("location") ?? undefined;
    } else {
      return undefined; // No redirect
    }
  } catch (error) {
    console.error("Error while retrieving url:", error);
    return undefined;
  }
};

const cleanUrl = async (url: string): Promise<CleanResult> => {
  if (url.includes("search.app")) {
    return {
      type: "degoogle",
      data: await extractRedirect(url),
    };
  }
  return { type: "tidy", data: TidyURL.clean(url) };
};

const filterCleanResult = (input: CleanResult) => {
  if (input.type === "tidy") return input.data.info.reduction > 0;
  return typeof input.data !== "undefined";
};

const urlFromCleanResult = (input: CleanResult) => {
  if (input.type == "tidy") return input.data.url;
  return input.data;
};

export const maybeRespondWithCleanUrl = async (
  message: Message,
  config: AppConfig
) => {
  const urls = extractUrls(message.content);

  if (!urls || !urls.length || message.author.bot) return;

  const sanitizedUrls = (
    await Promise.all(urls.filter((url) => TidyURL.validate(url)).map(cleanUrl))
  )
    .filter(filterCleanResult)
    .map(urlFromCleanResult)
    .filter(exists);

  if (!sanitizedUrls.length) return;

  await message.channel.send({
    content: speak(`${sanitizedUrls.map((x) => `- ${x}`).join("\n")}`),
    reply: message,
  });
};
