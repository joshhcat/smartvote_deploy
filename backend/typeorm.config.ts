import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export const typeOrmConfigFactory = (
  configService: ConfigService,
): DataSourceOptions => ({
  type: 'mysql',
  host: configService.get<string>('DATABASE_HOST'),
  // ✅ FIX: Ensure fallback to Aiven default port if env is missing
  port: Number(configService.get<string>('DATABASE_PORT')) || 18674,
  username: configService.get<string>('DATABASE_USER'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  database: configService.get<string>('DATABASE_NAME'),

  // ✅ FIX: Updated path for production
  // When NestJS builds, it moves everything to a 'dist' folder. 
  // This path ensures it finds entities in both dev (.ts) and prod (.js).
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],

  synchronize: false, // Keep false for production safety
  logging: configService.get<string>('NODE_ENV') === 'development',

  // ✅ REQUIRED for Aiven Cloud MySQL
  ssl: {
    rejectUnauthorized: false,
  },

  extra: {
    connectionLimit: 10,
    connectTimeout: 30000,
    // ✅ FIX: Some MySQL drivers need this for Aiven/DigitalOcean
    waitForConnections: true,
  },
});

export default typeOrmConfigFactory;