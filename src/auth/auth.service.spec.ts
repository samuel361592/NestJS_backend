import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockRoleRepository = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked-jwt'),
  };

  const fakeRole: Role = {
    id: 1,
    name: 'user',
    users: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Role), useValue: mockRoleRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      await expect(
        authService.register({
          email: 'exist@test.com',
          password: '12345678',
          name: 'Test',
          age: 20,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if role "user" not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockRoleRepository.findOne.mockResolvedValue(null);
      await expect(
        authService.register({
          email: 'new@test.com',
          password: '12345678',
          name: 'Test',
          age: 20,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should register successfully and return token', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockRoleRepository.findOne.mockResolvedValue(fakeRole);

      const userData: User = {
        id: 1,
        email: 'new@test.com',
        password: 'hashedPassword',
        name: 'Test',
        age: 20,
        posts: [],
        roles: [fakeRole],
      };

      mockUserRepository.create.mockReturnValue(userData);
      mockUserRepository.save.mockResolvedValue(userData);

      const result = await authService.register({
        email: 'new@test.com',
        password: '12345678',
        name: 'Test',
        age: 20,
      });

      expect(result).toEqual({
        message: '註冊成功',
        token: 'mocked-jwt',
      });
    });
  });

  describe('login', () => {
    it('should throw if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(
        authService.login({
          email: 'notfound@test.com',
          password: '12345678',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password is incorrect', async () => {
      const user: User = {
        id: 1,
        email: 'test@test.com',
        name: 'Test',
        age: 20,
        password: await bcrypt.hash('correct-password', 10),
        posts: [],
        roles: [fakeRole],
      };
      mockUserRepository.findOne.mockResolvedValue(user);

      await expect(
        authService.login({
          email: 'test@test.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token on successful login', async () => {
      const user: User = {
        id: 1,
        email: 'test@test.com',
        name: 'Test',
        age: 20,
        password: await bcrypt.hash('12345678', 10),
        posts: [],
        roles: [fakeRole],
      };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await authService.login({
        email: 'test@test.com',
        password: '12345678',
      });

      expect(result).toEqual({ token: 'mocked-jwt' });
    });
  });

  describe('getProfile', () => {
    it('should throw if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(authService.getProfile(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return user if found', async () => {
      const user: User = {
        id: 1,
        email: 'user@test.com',
        name: 'Test',
        age: 20,
        password: 'xxx',
        posts: [],
        roles: [fakeRole],
      };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await authService.getProfile(1);
      expect(result).toEqual(user);
    });
  });
});
