import 'dotenv/config';
import { get } from 'env-var';

export const envs = {
  APP_URL: get('APP_URL').required().asUrlString(),
  APP_PORT: get('APP_PORT').required().asPortNumber(),

  DB_HOST: get('DB_HOST').required().asString(),
  DB_PORT: get('DB_PORT').required().asPortNumber(),
  DB_NAME: get('DB_NAME').required().asString(),
  DB_USER: get('DB_USER').required().asString(),
  DB_PASSWORD: get('DB_PASSWORD').required().asString(),
};
