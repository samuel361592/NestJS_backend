import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtPayload } from './jwt.strategy';

describe('AuthController', () => {
  let controller: AuthController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let authService: AuthService;

  const mockRegister = jest.fn().mockResolvedValue({ message: '註冊成功' });
  const mockLogin = jest.fn().mockResolvedValue({ token: 'fake-jwt-token' });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: mockRegister,
            login: mockLogin,
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
    expect(mockRegister).toHaveBeenCalled();
  });

  it('應該成功登入', async () => {
    const result = await controller.login({
      email: 'test@test.com',
      password: '12345678',
    });
    expect(result).toEqual({ token: 'fake-jwt-token' });
    expect(mockLogin).toHaveBeenCalled();
  });

  it('應該成功取得 profile', () => {
    const mockUser: JwtPayload = {
      id: 1,
      email: 'test@test.com',
      name: 'Sam',
      age: 25,
      role: 'user',
    };
    const req = { user: mockUser } as Request & { user: JwtPayload };
    const result = controller.getProfile(req);
    expect(result).toEqual({ user: mockUser });
  });
});
