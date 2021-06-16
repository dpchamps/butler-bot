import fetch from "node-fetch";
import { Message } from "discord.js";
import { BotCommand } from "../../bot/parseCommand";
import { AppConfig } from "../../config";
import assert from "assert";
import * as RT from "runtypes";
import { deepApology, speak } from "../../bot/speak";
import FormData from "form-data";
import {createFormData, Option, orDefault} from "../../util";

const ImgFlipGetResponse = RT.Record({
  success: RT.Literal(true),
  data: RT.Record({
    memes: RT.Array(
      RT.Record({
        id: RT.String,
        name: RT.String,
      })
    ),
  }),
});

const ImgFlipGenerateResponse = RT.Union(
  RT.Record({
    success: RT.Literal(true),
    data: RT.Record({
      url: RT.String,
      page_url: RT.String,
    }),
  }),
  RT.Record({
    success: RT.Literal(false),
    error_message: RT.String,
  })
);

type ImgFlipResponse = RT.Static<typeof ImgFlipGenerateResponse>;


const getMessageFromGenerateResponse = (response: ImgFlipResponse) =>
  response.success
    ? {
        files: [response.data.url],
        content: speak("I've made your meme straight away!"),
      }
    : speak(
        `I couldn't make that meme. The reason is quite technical, you see ${JSON.stringify(response)}`
      );

interface MemeCache {
  data: Option<
    Array<{
      id: string;
      name: string;
    }>
  >;
  updated: Option<string>;
}
const memeCache: MemeCache = {
  data: undefined,
  updated: undefined,
};
const searchForMeme = async (memeName: Option<string>) => {
  if (!memeName) {
    throw new Error(
      `I expected this command: \`butler: meme. <meme name>. <top text>. <bottom text>\``
    );
  }
  const regex = new RegExp(memeName, "gi");
  const memes = orDefault(
    memeCache.data,
    (
      await fetch("https://api.imgflip.com/get_memes")
        .then((res) => res.json())
        .then(ImgFlipGetResponse.check)
    ).data.memes
  );

  memeCache.data = memes;

  return memes.find(({ id, name }) => name.match(regex))?.id;
};

const makeMeme = (body: FormData) =>
    fetch("https://api.imgflip.com/caption_image", {
    method: "POST",
    body,
  })
    .then((res) => res.json())
    .then(ImgFlipGenerateResponse.check)
    .then(getMessageFromGenerateResponse);

const outputError = (message: Message) => (e: Error) => {
  console.error(`[meme]`, e);
  return message.channel.send(deepApology(e.message));
};

export const meme = (
  message: Message,
  { content }: BotCommand,
  config: AppConfig
) => {
  const [memeName, ...memeContent] = content;

  return searchForMeme(memeName)
    .then((id) => {
      assert(id, `I couldn't find a meme that matches that description.`);
      return id;
    })
    .then((templateId) =>
      makeMeme(
        createFormData({
          template_id: templateId,
          username: config.IMGFLIP_USERNAME,
          password: config.IMGFLIP_PASSWORD,
          boxes: memeContent.map(x => ({text: x.toUpperCase()}))
        })
      )
    )

    .then((x) => message.channel.send(x))
    .catch(outputError(message));
};
