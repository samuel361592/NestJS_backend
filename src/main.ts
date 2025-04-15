import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './data-source';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ 開啟 CORS（允許前端請求）
  app.enableCors({
    origin: true, // 允許任意來源（開發用）
    credentials: true,
  });

  await app.listen(3001);
}
bootstrap();