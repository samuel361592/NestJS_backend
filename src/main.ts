import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://nextjsfrontend-green.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Fullstack Project API')
    .setDescription('這是 API 文件')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: '一般登入使用者的 JWT' },
      'jwt',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: '需要 admin 的 role 權限' },
      'admin',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = Number(process.env.PORT) || 3001;

  app
    .listen(port, '0.0.0.0')
    .then(() => {
      logger.log(`Server is running on port ${port}`);
      logger.log(`Swagger is available at /api`);
    })
    .catch((err) => {
      logger.error('啟動失敗', err);
      process.exit(1);
    });
}

bootstrap();
