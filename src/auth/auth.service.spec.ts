import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthService 測試', () => {
  let authService: AuthService;
  let userRepo: jest.Mocked<Repository<User>>;
  let roleRepo: jest.Mocked<Repository<Role>>;
  let userRoleRepo: jest.Mocked<Repository<UserRole>>;
  let jwtService: JwtService;

  beforeEach(() => {
    userRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    roleRepo = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<Role>>;

    userRoleRepo = {
      create: jest.fn().mockImplementation((data: UserRole): UserRole => data),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<UserRole>>;

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked-token'),
    } as unknown as JwtService;

    authService = new AuthService(userRepo, roleRepo, userRoleRepo, jwtService);
  });

  it('應該成功註冊', async () => {
    userRepo.findOne.mockResolvedValue(null);
    roleRepo.findOne.mockResolvedValue({ name: 'user', id: 1 } as Role);
    userRepo.save.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      name: 'Sam',
      age: 20,
      password: '',
      userRoles: [],
      posts: [],
    });

    const dto: RegisterDto = {
      email: 'test@example.com',
      password: '12345678',
      name: 'Sam',
      age: 20,
    };
    const res = await authService.register(dto);
    expect(res).toEqual({ message: '註冊成功' });
  });

  it('註冊時 email 已存在', async () => {
    userRepo.findOne.mockResolvedValue({} as User);
    await expect(
      authService.register({
        email: 'test@example.com',
        password: '12345678',
        name: 'Sam',
        age: 20,
      }),
    ).rejects.toThrow('信箱已註冊');
  });

  it('正常登入', async () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      name: 'Sam',
      age: 20,
      password: await bcrypt.hash('12345678', 10),
      userRoles: [{ role: { name: 'user' }, id: 1, user: {} as User }],
      posts: [],
    } as unknown as User;

    userRepo.findOne.mockResolvedValue(user);

    const dto: LoginDto = {
      email: 'test@example.com',
      password: '12345678',
    };

    const res = await authService.login(dto);
    expect(res).toHaveProperty('token');
  });

  it('登入時找不到帳號', async () => {
    userRepo.findOne.mockResolvedValue(null);
    await expect(
      authService.login({
        email: 'test@example.com',
        password: '12345678',
      }),
    ).rejects.toThrow('找不到使用者');
  });

  it('登入時密碼錯誤', async () => {
    const user = {
      password: await bcrypt.hash('wrongpass', 10),
      userRoles: [],
      posts: [],
    } as unknown as User;

    userRepo.findOne.mockResolvedValue(user);
    await expect(
      authService.login({
        email: 'test@example.com',
        password: '12345678',
      }),
    ).rejects.toThrow('密碼錯誤');
  });
});
