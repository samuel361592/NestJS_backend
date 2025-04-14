import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    // 全域載入 .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 使用 DATABASE_URL 連線字串（建議使用 dotenv 搭配 CLI 指令）
    TypeOrmModule.forRoot({
      type: 'mysql',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // 通用寫法，部署與開發皆可用
      synchronize: false,
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
    }),

    AuthModule,
    UserModule,
    PostModule,
  ],
})
export class AppModule {}
