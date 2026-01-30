import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const postgresConfig = (
  configservice: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configservice.get<string>('pg_db.host'),
  port: configservice.get<number>('pg_db.port'),
  username: configservice.get<string>('pg_db.username'),
  password: configservice.get<string>('pg_db.password'),
  database: configservice.get<string>('pg_db.db'),
  autoLoadEntities: true,
  entities: [],
  synchronize: true, // dev only
});
