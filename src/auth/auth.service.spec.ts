/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { RoleService } from 'src/role/role.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ErrorCode } from 'src/common/errors/error-codes.enum';
import { Repository } from 'typeorm';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepo: jest.Mocked<Repository<User>>;
  let roleService: jest.Mocked<RoleService>;
  let jwtService: jest.Mocked<JwtService>;

  const fakeRole = { id: 1, name: 'user', users: [] };

  beforeEach(async () => {
    const userRepoMock: Partial<jest.Mocked<Repository<User>>> = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    const roleSvcMock: Partial<jest.Mocked<RoleService>> = {
      findByName: jest.fn(),
    };
    const jwtSvcMock: Partial<jest.Mocked<JwtService>> = {
      sign: jest.fn().mockReturnValue('token-123'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepoMock },
        { provide: RoleService, useValue: roleSvcMock },
        { provide: JwtService, useValue: jwtSvcMock },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepo = module.get<jest.Mocked<Repository<User>>>(
      getRepositoryToken(User),
    );
    roleService = module.get<jest.Mocked<RoleService>>(RoleService);
    jwtService = module.get<jest.Mocked<JwtService>>(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('throws ConflictException if email exists', async () => {
      userRepo.findOne.mockResolvedValue({ id: 1 } as User);
      await expect(
        authService.register({
          email: 'a@a.com',
          password: 'p',
          name: 'A',
          age: 1,
        }),
      ).rejects.toMatchObject({
        response: { errorCode: ErrorCode.EmailAlreadyExists },
      });
    });

    it('throws NotFoundException if role missing', async () => {
      userRepo.findOne.mockResolvedValue(null);
      roleService.findByName.mockResolvedValue(null);
      await expect(
        authService.register({
          email: 'b@b.com',
          password: 'p',
          name: 'B',
          age: 2,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('creates user and returns token', async () => {
      userRepo.findOne.mockResolvedValue(null);
      roleService.findByName.mockResolvedValue(fakeRole);

      const newUser = {
        id: 1,
        email: 'c@c.com',
        name: 'C',
        age: 3,
        password: 'hashed',
        posts: [],
        roles: [fakeRole],
      } as User;

      userRepo.create.mockReturnValue(newUser);
      userRepo.save.mockResolvedValue(newUser);

      const res = await authService.register({
        email: 'c@c.com',
        password: 'pw',
        name: 'C',
        age: 3,
      });

      expect(userRepo.create).toHaveBeenCalledWith({
        email: 'c@c.com',
        password: expect.any(String) as string,
        name: 'C',
        age: 3,
        roles: [fakeRole],
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: 1,
        email: 'c@c.com',
        name: 'C',
        age: 3,
        roles: ['user'],
      });
      expect(res).toEqual({ message: '註冊成功', token: 'token-123' });
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(
        authService.login({ email: 'x@x.com', password: 'p' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if password wrong', async () => {
      const u = {
        id: 2,
        email: 'u@u.com',
        name: 'U',
        age: 2,
        password: await bcrypt.hash('right', 10),
        posts: [],
        roles: [fakeRole],
      } as unknown as User;
      userRepo.findOne.mockResolvedValue(u);

      await expect(
        authService.login({ email: 'u@u.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns token if creds valid', async () => {
      const u = {
        id: 3,
        email: 'v@v.com',
        name: 'V',
        age: 3,
        password: await bcrypt.hash('secret', 10),
        posts: [],
        roles: [fakeRole],
      } as unknown as User;
      userRepo.findOne.mockResolvedValue(u);

      const out = await authService.login({
        email: 'v@v.com',
        password: 'secret',
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        id: 3,
        email: 'v@v.com',
        name: 'V',
        age: 3,
        roles: ['user'],
      });
      expect(out).toEqual({ token: 'token-123' });
    });
  });

  describe('getProfile', () => {
    it('throws NotFoundException if user missing', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(authService.getProfile(99)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns user if found', async () => {
      const u = {
        id: 4,
        email: 'w@w.com',
        name: 'W',
        age: 4,
        password: 'h',
        posts: [],
        roles: [fakeRole],
      } as unknown as User;
      userRepo.findOne.mockResolvedValue(u);
      await expect(authService.getProfile(4)).resolves.toEqual(u);
    });
  });
});
