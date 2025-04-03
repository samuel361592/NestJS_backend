import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppService],
    }).compile();

    appService = module.get<AppService>(AppService);
  });

  it('應該要成功執行 healthCheck()', () => {
    const result = appService.healthCheck();
    expect(result).toHaveProperty('status', 'OK');
    expect(result).toHaveProperty('project', 'Fullstack Project');
    expect(result).toHaveProperty('version', '1.0.0');
    expect(result).toHaveProperty('timestamp');
  });
});
