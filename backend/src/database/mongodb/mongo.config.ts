import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

const logger = new Logger('MONGODB');
export const mongoConfig = (
  configservice: ConfigService,
): MongooseModuleOptions => ({
  uri: configservice.get<string>('mongo_db.uri'),
  onConnectionCreate: (connection: Connection) => {
    connection.on('connected', () => logger.log('connected'));
    connection.on('open', () => logger.log('open'));
    connection.on('disconnected', () => logger.log('disconnected'));
    connection.on('reconnected', () => logger.log('reconnected'));
    connection.on('disconnecting', () => logger.log('disconnecting'));

    return connection;
  },
});
