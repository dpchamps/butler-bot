import {Record, String, Number, Static} from "runtypes";
import {config} from 'dotenv';
import {join} from 'path';



const AppConfig = Record({
    DISCORD_APPLICATION_ID: String,
    DISCORD_CLIENT_ID: String,
    DISCORD_CLIENT_SECRET: String,
    DISCORD_BOT_TOKEN: String
});

export type AppConfig = Static<typeof AppConfig>

export const getConfig = () => {
    config({path: join(process.cwd(), `.${process.env.NODE_ENV}.env`)});

    const {
        DISCORD_APPLICATION_ID,
        DISCORD_CLIENT_ID,
        DISCORD_CLIENT_SECRET,
        DISCORD_BOT_TOKEN
    } = process.env;


    return AppConfig.check({
        DISCORD_APPLICATION_ID,
        DISCORD_CLIENT_ID,
        DISCORD_CLIENT_SECRET,
        DISCORD_BOT_TOKEN
    });
};


