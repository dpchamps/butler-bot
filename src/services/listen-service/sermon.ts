import {Message} from "discord.js";
import {getRandom, range, STATIC_DIR, tap} from "../../util";
import {promises as fs} from 'fs';
import {join} from 'path';
import {speak} from "../../bot/speak";

const prepareSermon = (sermon: string) => fs.readdir(join(STATIC_DIR, "time-cube"))
    .then((x) => x.filter(y => !y.endsWith("txt")))
    .then(getRandom)
    .then(x => join(STATIC_DIR, 'time-cube', x))
    .then(file => ({content: speak(`Wonderful day for some cubic thought.\n\n${sermon}`), files: [file]}));

export const sermon = async (message: Message) =>
    fs.readFile(join(STATIC_DIR, "time-cube", "sermon.txt"), 'utf-8')
        .then(x => x.split("\n").filter(Boolean))
        .then(lines => range(0, 3).map(() => getRandom(lines)))
        .then(x => x.map(y => `**_${y}_**`).join("\n"))
        .then(prepareSermon)
        .then(x => message.channel.send(x));
