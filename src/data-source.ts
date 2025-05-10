import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';
import { parse } from 'url';

const dbUrl = process.env.DATABASE_URL || '';
const parsedUrl = parse(dbUrl);
const [username, password] = (parsedUrl.auth || '').split(':');
const dbName = (parsedUrl.pathname || '').replace('/', '');

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: parsedUrl.hostname ?? 'localhost',
  port: parseInt(parsedUrl.port || '3306'),
  username,
  password,
  database: dbName,
  entities: [User, Post, Role],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
console.log('正在使用資料庫：', dbName);
