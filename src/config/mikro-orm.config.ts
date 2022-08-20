import { MikroOrmModuleOptions as Options } from '@mikro-orm/nestjs';
import { LoadStrategy } from '@mikro-orm/core';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { Logger } from '@nestjs/common';
import { Bucket, Category, Challenge, Question, User } from '../entities';

const logger = new Logger('MikroORM');

export const config: Options = {
  dbName: process.env.DB_NAME,
  type: 'postgresql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,

  entities: [User, Category, Challenge, Question, Bucket],
  debug: true,

  loadStrategy: LoadStrategy.JOINED,
  highlighter: new SqlHighlighter(),
  registerRequestContext: false,

  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
  },

  logger: logger.log.bind(logger),
};

export default config;
