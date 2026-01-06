
import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export const typeOrmConfigFactory = (
  configService: ConfigService,
): DataSourceOptions => ({
  type: 'mysql',
  host: configService.get<string>('DATABASE_HOST'),
  port: configService.get<number>('DATABASE_PORT'),
  username: configService.get<string>('DATABASE_USER'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  database: configService.get<string>('DATABASE_NAME'),
  synchronize: false, // Caution: Only use synchronize in development environments
  logging: false,
  // Other configuration options...
  extra: {
    connectionLimit: 30, // Optional: Limit the number of connections in the pool
    connectTimeout: 30000, // Increase connection timeout (in milliseconds)
    // idleTimeoutMillis: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 30000,
  },
});
export default typeOrmConfigFactory;