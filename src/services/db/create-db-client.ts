import { Client } from "ts-postgres";
import { AppConfig } from "../../config";

export const createDbClient = async ({
  POSTGRES_DB,
  POSTGRES_PASSWORD,
  POSTGRES_USER,
}: AppConfig) => {
  const client = new Client({
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    port: 5400,
  });
  console.info(`Creating Database Client...`);
  await client.connect();
  console.log(`Database client connected`);

  return client;
};
