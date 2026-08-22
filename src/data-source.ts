import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource, DataSourceOptions } from 'typeorm';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL is not defined');
}

const entities = [User, Post, Role];
const isMysql = dbUrl.startsWith('mysql://') || dbUrl.startsWith('mysql2://');

const dataSourceOptions: DataSourceOptions = isMysql
  ? {
      type: 'mysql',
      url: dbUrl,
      entities,
      migrations: ['dist/migrations/mysql/*.js'],
      synchronize: false,
      logging: false,
    }
  : {
      type: 'postgres',
      url: dbUrl,
      ssl: { rejectUnauthorized: false },
      entities,
      migrations: ['dist/migrations/PostgreSQL/*.js'],
      synchronize: false,
      logging: false,
    };

export const AppDataSource = new DataSource(dataSourceOptions);
