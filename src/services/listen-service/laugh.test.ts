import { laugh } from "./laugh";
import { promises } from "fs";
import { mocked } from "ts-jest/utils";
import { Message } from "discord.js";
import { MockedObject } from "ts-jest/dist/utils/testing";

jest.mock("fs", () => ({
  promises: {
    readdir: jest.fn().mockResolvedValue(["one"]),
  },
}));

const promisesMock = mocked(promises);

const getMessageMock = (reference?: string, messageID?: string) =>
  ({
    channel: {
      send: jest.fn(),
      messages: {
        fetch: jest.fn(),
      },
    },
    reference: {
      reference,
      messageID,
    },
  } as unknown as MockedObject<Message>);

describe("laugh", () => {
  afterEach(jest.clearAllMocks);

  it("Should laugh at a user with a funny image", async () => {
    const fakeMessage = getMessageMock("abracadabra", "alakazam");

    (fakeMessage.channel.messages.fetch as jest.Mock).mockResolvedValue({
      author: "Yosemite",
    });

    await laugh(fakeMessage);

    expect(promisesMock.readdir).toHaveBeenCalledWith(
      expect.stringMatching("girls-laughing")
    );
    expect(fakeMessage.channel.messages.fetch).toHaveBeenCalledWith("alakazam");
    expect(fakeMessage.channel.send).toHaveBeenCalledWith({
      content: expect.stringMatching("They're laughing at you"),
      files: expect.arrayContaining([expect.any(String)]),
    });
  });

  it("Should apologize if no reference is found", async () => {
    const fakeMessage = getMessageMock();

    await laugh(fakeMessage);

    expect(fakeMessage.channel.send).toHaveBeenCalledWith(
      expect.stringMatching(
        "I'm not quite sure whom it is you'd like me to laugh at."
      )
    );
  });

  it("Should apologize is something goes wrong with fetching a user", async () => {
    const fakeMessage = getMessageMock("abracadabra", "alakazam");

    (fakeMessage.channel.messages.fetch as jest.Mock).mockRejectedValue(
      new Error("Ow That Hurts")
    );

    await laugh(fakeMessage);

    expect(fakeMessage.channel.send).toHaveBeenCalledWith(
      expect.stringMatching("Something went wrong while I started laughing.")
    );
  });
});
