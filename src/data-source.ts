import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';

const isTs = process.env.NODE_ENV !== 'production';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fullstackdb_test',
  entities: [isTs ? 'src/entities/*.ts' : 'dist/entities/*.js'],
  migrations: [isTs ? 'src/migrations/*.ts' : 'dist/migrations/*.js'],
  synchronize: false,
  logging: true,
});

console.log('正在使用資料庫：', process.env.DB_NAME);
