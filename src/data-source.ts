import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL is not defined');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: dbUrl,

  ssl: { rejectUnauthorized: false },

  entities: [User, Post, Role],

  migrations: ['dist/migrations/*.js'],

  synchronize: false,
  logging: false,
});
