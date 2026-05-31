import {
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Lightweight health check for Render uptime probes.
   */
  @Get()
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
