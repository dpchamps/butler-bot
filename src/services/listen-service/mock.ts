import {Message} from "discord.js";
import {deepApology, speak} from "../../bot/speak";
import {mockingCase} from "../../util";



export const mock = async (message: Message) => {
    if(!message.reference || !message.reference.messageID){
        await message.channel.send(deepApology(`I'd love to mock someone for you, but I don't know who to mock!`))
        return
    }
    const toMock = await message.channel.messages.fetch(message.reference.messageID);

    if(!toMock){
        await message.channel.send(deepApology(`I couldn't quite ascertain to correct casing for mocking this.`))
    }

    return message.channel.send(`${toMock.author}, This is you: \n\n${mockingCase(toMock.content)}`)
};
