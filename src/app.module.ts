import * as dotenv from 'dotenv';
import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { RoleModule } from './role/role.module';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
const isMysql =
  databaseUrl?.startsWith('mysql://') || databaseUrl?.startsWith('mysql2://');

const typeOrmOptions: TypeOrmModuleOptions = isMysql
  ? {
      type: 'mysql',
      url: databaseUrl,
      autoLoadEntities: true,
      synchronize: false,
    }
  : {
      type: 'postgres',
      url: databaseUrl,
      ssl: { rejectUnauthorized: false },
      autoLoadEntities: true,
      synchronize: false,
    };

@Module({
  imports: [
    HealthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot(typeOrmOptions),

    AuthModule,
    UserModule,
    PostModule,
    RoleModule,
  ],
  providers: [],
})
export class AppModule {}
