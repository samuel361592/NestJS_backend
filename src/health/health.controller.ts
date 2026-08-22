import {
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Lightweight health check for Render uptime probes.
   */
  @Get()
  @ApiOperation({ summary: '服務健康檢查' })
  @ApiResponse({
    status: 200,
    description: '服務正常',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-08-22T12:00:00.000Z',
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Database health check.
   *
   * Running SELECT 1 through TypeORM verifies that the app can reach Supabase
   * PostgreSQL, so this endpoint keeps both the Render service and database
   * connection path active.
   */
  @Get('db')
  @ApiOperation({ summary: '資料庫連線健康檢查' })
  @ApiResponse({
    status: 200,
    description: '資料庫連線正常',
    schema: {
      example: {
        status: 'db-ok',
        timestamp: '2026-08-22T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '資料庫連線異常',
    schema: {
      example: {
        status: 'db-error',
        timestamp: '2026-08-22T12:00:00.000Z',
      },
    },
  })
  async getDatabaseHealth() {
    try {
      await this.dataSource.query('SELECT 1');

      return {
        status: 'db-ok',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);

      throw new InternalServerErrorException({
        status: 'db-error',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
