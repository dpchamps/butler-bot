import { getConfig } from "./config";
import { startClient } from "./discord-client/startClient";

const handleTopLevelApplicationError = (e: Error) => {
  console.error(`Encountered an unrecoverable error`, e);
};

const main = async () => {
  const config = getConfig();
  const shutdownClient = await startClient(config);

  process.on("SIGTERM", () => {
    shutdownClient();
  });
};

main().catch(handleTopLevelApplicationError);
