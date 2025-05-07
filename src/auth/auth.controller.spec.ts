import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { JwtPayload } from './jwt.strategy';
import { Request } from 'express';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req: Request & {
            user: {
              id: number;
              email: string;
              name: string;
              age: number;
              roles: string[];
            };
          } = context.switchToHttp().getRequest();

          req.user = {
            id: 1,
            email: 'test@example.com',
            name: 'Test User',
            age: 30,
            roles: ['user'],
          };

          return true;
        },
      })

      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('應該註冊成功並回傳 token', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        age: 30,
      };

      const result = {
        message: '註冊成功',
        token: 'jwt-token',
      };

      mockAuthService.register.mockResolvedValue(result);

      await expect(controller.register(dto)).resolves.toEqual(result);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('應該登入成功並回傳 token', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = { token: 'jwt-token' };
      mockAuthService.login.mockResolvedValue(result);

      await expect(controller.login(dto)).resolves.toEqual(result);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('getProfile', () => {
    it('應該取得使用者資料', async () => {
      const userEntity = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        age: 30,
        roles: [{ name: 'user' }],
      };

      mockAuthService.getProfile.mockResolvedValue(userEntity);

      // 明確轉型為符合型別要求的 Request & { user: JwtPayload }
      const req = {
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          age: 30,
          roles: ['user'],
        },
      } as unknown as Request & { user: JwtPayload };

      const result = await controller.getProfile(req);

      expect(result).toEqual({
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          age: 30,
          roles: ['user'],
        },
      });
      expect(mockAuthService.getProfile).toHaveBeenCalledWith(1);
    });
  });
});
