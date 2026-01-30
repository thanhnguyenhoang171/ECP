import { parsePort } from 'src/helpers/common-parse.helper';

export default () => ({
  port: parsePort(process.env.PORT, 10) || 3000,
  mongo_db: {
    uri: process.env.MONGO_URI,
  },
  pg_db: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parsePort(process.env.POSTGRES_PORT, 10) || 5432,
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    db: process.env.POSTGRES_DB || 'test',
  },
});
