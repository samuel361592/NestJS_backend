import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue({ message: '註冊成功' }),
            login: jest.fn().mockResolvedValue({ token: 'fake-jwt-token' }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('應該成功註冊', async () => {
    const result = await controller.register({
      email: 'test@test.com',
      password: '12345678',
      name: 'sam',
      age: 20,
    });
    expect(result).toEqual({ message: '註冊成功' });
    expect(authService.register).toBeCalled();
  });

  it('應該成功登入', async () => {
    const result = await controller.login({
      email: 'test@test.com',
      password: '12345678',
    });
    expect(result).toEqual({ token: 'fake-jwt-token' });
    expect(authService.login).toBeCalled();
  });

  it('應該成功取得 profile', () => {
    const mockUser = { id: 1, email: 'test@test.com' };
    const result = controller.getProfile({ user: mockUser });
    expect(result).toEqual({ user: mockUser });
  });
});
