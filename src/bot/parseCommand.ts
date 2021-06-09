import {Literal, Union, Static, check} from 'runtypes';
import {Option} from "../util";

const BotType = Union(Literal("echo"), Literal("invalid"), Literal("meme"));
type BotType = Static<typeof BotType>;

export type BotCommand = {
    type: BotType;
    content: string[];
    isValid: boolean;
    invalidCommand: Option<string>
}

const validateType = (type: string): BotType => {
    try {
        return BotType.check(type)
    }catch{
        return "invalid"
    }
};

export const parseCommand = (input: string): BotCommand => {
    const isValid = input.startsWith("butler:");
    const [type, ...content] = input.replace("butler:", "").trim().split(".").map(x => x.trim());
    const checkedType = validateType(type);

    return {
        type: checkedType,
        content: content,
        isValid,
        invalidCommand: checkedType === "invalid" ? type : undefined
    }

};
