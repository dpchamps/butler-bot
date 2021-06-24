import { echo } from "./echo";
import { Message } from "discord.js";
import { BotCommand } from "../../bot/parseCommand";
import { speak } from "../../bot/speak";

describe("echo", () => {
  it("Should echo things", async () => {
    const fakeMessage = {
      channel: {
        send: jest.fn(),
      },
    } as unknown as Message;

    await echo(fakeMessage, { content: ["hello", "world"] } as BotCommand);

    expect(fakeMessage.channel.send).toHaveBeenCalledWith(
      expect.stringMatching('I will now repeat what you asked: "hello. world"')
    );
  });

  it("Should echo referenced things things", async () => {
    const messageID = "bazingo";
    const fetchContent = `I said a long
    multiline this, lololol`;
    const fakeMessage = {
      reference: {
        messageID,
      },
      channel: {
        send: jest.fn(),
        messages: {
          fetch: jest.fn(() => Promise.resolve({ content: fetchContent })),
        },
      },
    } as unknown as Message;

    await echo(fakeMessage, { content: ["hello", "world"] } as BotCommand);

    expect(fakeMessage.channel.send).toHaveBeenCalledWith(
      expect.stringMatching(
        `I will now repeat what you asked: "${fetchContent}"`
      )
    );
  });
});
