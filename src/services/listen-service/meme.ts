import fetch from 'node-fetch';
import {Message} from "discord.js";
import {BotCommand} from "../../bot/parseCommand";
import {AppConfig} from "../../config";
import assert from "assert";
import * as RT from "runtypes";
import {speak} from "../../bot/speak";
import FormData from 'form-data';
import {Option, orDefault} from "../../util";

const ImgFlipResponse = RT.Union(
    RT.Record({
            success: RT.Literal(true),
            data: RT.Record({
                url: RT.String,
                page_url: RT.String
            })
    }),
    RT.Record({
            success: RT.Literal(false),
            error_message: RT.String,
    })
);

type ImgFlipResponse = RT.Static<typeof ImgFlipResponse>;


const memeGenerateFormData = (options :Record<string, Option<string>>) => {
    const form = new FormData();

    Object.entries(options).forEach(([k, v]) => form.append(k, orDefault(v, "")));

    return form;
};

const getMessageFromGenerateResponse = (response: ImgFlipResponse) => response.success ? {
    files: [response.data.url],
    content: speak("I've made your meme straight away!")
} : speak(`So Sorry, I couldn't make that meme. The reason is quite technical, you see`);

const makeMeme = (body: FormData) => {
    return fetch("https://api.imgflip.com/caption_image", {
        method: "POST",
        body
    })
        .then(res => res.json())
        .then(ImgFlipResponse.check)
        .then(getMessageFromGenerateResponse)
};

export const meme = async (message: Message, {content}: BotCommand, config: AppConfig) => {
    const [templateId, topText, bottomText] = content;
    assert(templateId, "Expected templateid to exist for meme but found nothing!")


    return makeMeme(memeGenerateFormData({
        template_id: templateId,
        username: config.IMGFLIP_USERNAME,
        password: config.IMGFLIP_PASSWORD,
        text0: topText,
        text1: bottomText
    })).then(x => message.channel.send(x));
};
