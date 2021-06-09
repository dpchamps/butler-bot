import {Record, String, Number, Static, Union, Literal} from "runtypes";
import {config} from 'dotenv';
import {join} from 'path';



const AppConfig = Record({
    DISCORD_APPLICATION_ID: String,
    DISCORD_CLIENT_ID: String,
    DISCORD_CLIENT_SECRET: String,
    DISCORD_BOT_TOKEN: String,
    IMGFLIP_USERNAME: String,
    IMGFLIP_PASSWORD: String,
    DEBUG: Union(Literal(1), Literal(0))
});

export type AppConfig = Static<typeof AppConfig>

export const getConfig = () => {
    config({path: join(process.cwd(), `.${process.env.NODE_ENV}.env`)});

    const {
        DISCORD_APPLICATION_ID,
        DISCORD_CLIENT_ID,
        DISCORD_CLIENT_SECRET,
        DISCORD_BOT_TOKEN,
        IMGFLIP_USERNAME,
        IMGFLIP_PASSWORD,
        DEBUG
    } = process.env;


    return AppConfig.check({
        DISCORD_APPLICATION_ID,
        DISCORD_CLIENT_ID,
        DISCORD_CLIENT_SECRET,
        DISCORD_BOT_TOKEN,
        IMGFLIP_USERNAME,
        IMGFLIP_PASSWORD,
        DEBUG
    });
};


