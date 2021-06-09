import {Client} from "discord.js";

import {echoService} from "./services/echo";

export const composeClient = async (client: Client) => {
    echoService(client);
};
