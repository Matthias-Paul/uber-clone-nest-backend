import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  // Safe defaults for local development when env flags are not configured.
  // In production, explicitly set DB_SYNC=false.
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  name: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  synchronize:
    process.env.DB_SYNC !== undefined
      ? process.env.DB_SYNC === 'true'
      : process.env.NODE_ENV !== 'production',
  autoLoadEntities:
    process.env.DB_AUTO_LOAD !== undefined
      ? process.env.DB_AUTO_LOAD === 'true'
      : true,
}));
