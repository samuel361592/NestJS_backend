import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';
import { Role } from './entities/role.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '362578',
  database: 'fullstackdb_test',
  entities: [User, Post, Role],
  synchronize: false,
  logging: true,
  migrations: ['src/migrations/*.ts'],
});
console.log('Entities loaded:', [User, Post, Role]);