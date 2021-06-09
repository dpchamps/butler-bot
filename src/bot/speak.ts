import {getRandom, multiline} from "../util";

const PRELUDE = [
    `Yes, of course`,
    `Mmmmm, right away`,
    `Smashing, at once`,
];

const OUTRO = [
    `Forever and always at your service`,
    `Charmed`,
];

export const speak = (message: string) => multiline(
    `${getRandom(PRELUDE)}...`,
    message,
    `${getRandom(OUTRO)}.`
);
