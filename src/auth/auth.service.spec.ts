import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

describe('AuthService 測試', () => {
  let authService: AuthService;
  let userRepo: Repository<User>;
  let jwtService: JwtService;

  beforeEach(() => {
    userRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    } as any;

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked-token'),
    } as any;

    authService = new AuthService(userRepo, jwtService);
  });

  it('應該成功註冊', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue(null);
    (userRepo.save as jest.Mock).mockResolvedValue({});
    const res = await authService.register('test@example.com', '12345678', 'Sam', 20);
    expect(res).toEqual({ message: '註冊成功' });
  });

  it('註冊時 email 格式錯誤', async () => {
    await expect(authService.register('bademail', '12345678', 'Sam', 20)).rejects.toThrow('請輸入有效的 Email');
  });

  it('註冊時 密碼長度錯誤', async () => {
    await expect(authService.register('test@example.com', '123', 'Sam', 20)).rejects.toThrow('密碼長度需介於 8~60 字元');
  });

  it('註冊時 email 已存在', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue({} as User);
    await expect(authService.register('test@example.com', '12345678', 'Sam', 20)).rejects.toThrow('信箱已註冊');
  });

  it('正常登入', async () => {
    const user = { email: 'test@example.com', name: 'Sam', age: 20, password: await bcrypt.hash('12345678', 10) } as User;
    (userRepo.findOne as jest.Mock).mockResolvedValue(user);
    const res = await authService.login('test@example.com', '12345678');
    expect(res).toHaveProperty('token');
  });

  it('登入時找不到帳號', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue(null);
    await expect(authService.login('test@example.com', '12345678')).rejects.toThrow();
  });

  it('登入時密碼錯誤', async () => {
    const user = { password: await bcrypt.hash('99999999', 10) } as User;
    (userRepo.findOne as jest.Mock).mockResolvedValue(user);
    await expect(authService.login('test@example.com', '12345678')).rejects.toThrow();
  });

});
