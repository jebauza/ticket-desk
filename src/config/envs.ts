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

  JWT_SEED: get('JWT_SEED').required().asString(),
  JWT_EXPIRES_IN: get('JWT_EXPIRES_IN').default('2h').asString(),

  // Datasources alternativos (Mongo, API externa) — opcionales: solo se leen si
  // el composition root de algún feature decide arrancar ese datasource.
  MONGO_URL: get('MONGO_URL').asString(),
  MONGO_DB_NAME: get('MONGO_DB_NAME').asString(),
  EXTERNAL_API_URL: get('EXTERNAL_API_URL').asString(),
  EXTERNAL_API_KEY: get('EXTERNAL_API_KEY').asString(),
};
