import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppService {
    @Get()
    healthCheck() {
        return {
            status: 'OK',
            project: 'Fullstack Project',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
        };
    }
}
