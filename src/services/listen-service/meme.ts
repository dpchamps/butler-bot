import fetch from 'node-fetch';
import {Message} from "discord.js";
import {BotCommand} from "../../bot/parseCommand";
import {AppConfig} from "../../config";
import assert from "assert";
import {Record, Union, String, Boolean, Literal} from "runtypes";
import {speak} from "../../bot/speak";
import FormData from 'form-data';

const ImgFlipResponse = Union(
    Record({
            success: Literal(true),
            data: Record({
                url: String,
                page_url: String
            })
    }),
    Record({
            success: Literal(false),
            error_message: String,
    })
);

export const meme = (message: Message, {content}: BotCommand, config: AppConfig) => {
    const [templateId, topText, bottomText] = content;
    assert(templateId, "Expected templateid to exist for meme but found nothing!")
    console.info({templateId, topText, bottomText});
    console.info("Making request....");
    const form = new FormData();
    form.append('template_id', templateId);
    form.append("username", config.IMGFLIP_USERNAME);
    form.append("password", config.IMGFLIP_PASSWORD);
    form.append("text0", topText||"");
    form.append("text1", bottomText||"");
    console.log(form);

    fetch("https://api.imgflip.com/caption_image", {
        method: "POST",
        body: form
    })
        .then(res => res.json())
        .then(ImgFlipResponse.check)
        .then((response) => {
            console.info("Alright! got it.", {response});
            if(response.success){
                message.channel.send({
                    files: [response.data.url],
                    content: speak("I've made your meme straight away!")
                })
            } else {
                message.channel.send(speak(`So Sorry, I couldn't make that meme: ${response.error_message}`));
            }
        })

};
