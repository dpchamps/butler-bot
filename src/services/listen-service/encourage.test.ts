import { encourage } from "./encourage";
import { Message } from "discord.js";

describe("encourage", () => {
  const getFakeMessage = () =>
    ({
      reference: {
        messageID: "refId",
      },
      author: `BaseAuthor`,
      channel: {
        send: jest.fn(() => Promise.resolve()),
        messages: {
          fetch: jest.fn(() => Promise.resolve({ author: "reference" })),
        },
      },
    } as unknown as Message);

  it("Should encourage a referenced author", async () => {
    const fakeMessage = getFakeMessage();

    await encourage(fakeMessage);

    expect(fakeMessage.channel.messages.fetch).toHaveBeenCalledWith("refId");
    expect(fakeMessage.channel.send).toHaveBeenCalledWith(
      expect.stringMatching("reference,")
    );
  });

  it("Should encourage the base author", async () => {
    const fakeMessage = getFakeMessage();

    fakeMessage.reference = null;

    await encourage(fakeMessage);

    expect(fakeMessage.channel.messages.fetch).not.toHaveBeenCalled();
    expect(fakeMessage.channel.send).toHaveBeenCalledWith(
      expect.stringMatching("BaseAuthor,")
    );
  });
});
