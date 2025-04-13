import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';
import { Role } from './entities/role.entity';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true ,
      envFilePath: `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}`,}), // 讀取 .env

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || '',
      entities: [User, Post, Role],
      synchronize: true,
  }),
    AuthModule,
    UserModule,
    PostModule,
  ],
})
export class AppModule {}
