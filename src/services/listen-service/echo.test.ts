import {echo} from "./echo";
import {Message} from "discord.js";
import {BotCommand} from "../../bot/parseCommand";
import {speak} from "../../bot/speak";

describe("echo", () => {
    it("Should echo things", () => {
        const fakeMessage = {
            channel: {
                send: jest.fn()
            }
        } as unknown as Message;

        echo(fakeMessage, {content: ["hello", "world"]} as BotCommand);

        expect(fakeMessage.channel.send).toHaveBeenCalledWith(
            expect.stringMatching("I will now repeat what you asked: \"hello. world\"")
        )
    })
});
