// src/app.controller.ts

import { Controller, Get } from '@nestjs/common';

@Controller('health') //伺服器狀態檢查
export class AppController {
  @Get()
  healthCheck(): string {
    return 'OK';
  }
}
