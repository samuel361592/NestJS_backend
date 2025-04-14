import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';

// ✅ 手動匯入實體類別（一定要這樣做）
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fullstackdb_test',
  entities: [User, Post, Role],
  migrations: ['src/migrations/*.ts'], // 這個保留字串即可
  synchronize: false,
  logging: true,
});

console.log('正在使用資料庫：', process.env.DB_NAME);
