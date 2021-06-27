import { getConfig } from "./config";
import { createDiscordClient } from "./discord-client/createDiscordClient";
import { createDbClient } from "./services/db/create-db-client";
import { createDbService } from "./services/db/db";

const handleTopLevelApplicationError = (e: Error) => {
  console.error(`Encountered an unrecoverable error`, e);
  process.exit(1);
};

const main = async () => {
  const config = getConfig();

  const dbClient = await createDbClient(config);
  const dbService = await createDbService(config, dbClient);

  const shutdownClient = await createDiscordClient(config, dbService);

  process.on("SIGTERM", async () => {
    shutdownClient();
    await dbClient.end();
  });
};

main().catch(handleTopLevelApplicationError);
