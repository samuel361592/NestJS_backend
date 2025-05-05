import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtPayload } from './jwt.strategy';
import { Request as ExpressRequest } from 'express';

describe('AuthController', () => {
  let controller: AuthController;

  // 模擬 register / login
  const mockRegister = jest.fn().mockResolvedValue({ message: '註冊成功' });
  const mockLogin = jest.fn().mockResolvedValue({ token: 'fake-jwt-token' });

  // 模擬 getProfile 回傳的使用者實體（含 roles 關聯）
  const mockProfileEntity = {
    id: 1,
    email: 'test@test.com',
    name: 'Sam',
    age: 25,
    roles: [{ name: 'user' }],
  };
  const mockGetProfile = jest.fn().mockResolvedValue(mockProfileEntity);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: mockRegister,
            login: mockLogin,
            getProfile: mockGetProfile,
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('應該成功註冊', async () => {
    const result = await controller.register({
      email: 'test@test.com',
      password: '12345678',
      name: 'sam',
      age: 20,
    });
    expect(result).toEqual({ message: '註冊成功' });
    expect(mockRegister).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: '12345678',
      name: 'sam',
      age: 20,
    });
  });

  it('應該成功登入', async () => {
    const result = await controller.login({
      email: 'test@test.com',
      password: '12345678',
    });
    expect(result).toEqual({ token: 'fake-jwt-token' });
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: '12345678',
    });
  });

  it('應該成功取得 profile', async () => {
    // 這裡的 JwtPayload.roles 只是 string[]
    const mockUser: JwtPayload = {
      id: 1,
      email: 'test@test.com',
      name: 'Sam',
      age: 25,
      roles: ['user'],
    };

    // 強制轉型成 ExpressRequest & { user: JwtPayload }
    const req = { user: mockUser } as unknown as ExpressRequest & {
      user: JwtPayload;
    };

    const result = await controller.getProfile(req);
    // 應該會用 mockGetProfile 拿到 mockProfileEntity，
    // 並回傳 { user: { ... , roles: ['user'] } }
    expect(mockGetProfile).toHaveBeenCalledWith(mockUser.id);
    expect(result).toEqual({
      user: {
        id: mockProfileEntity.id,
        email: mockProfileEntity.email,
        name: mockProfileEntity.name,
        age: mockProfileEntity.age,
        roles: mockProfileEntity.roles.map((r) => r.name),
      },
    });
  });
});
