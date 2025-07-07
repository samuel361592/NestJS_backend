/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { RoleService } from 'src/role/role.service';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userRepo: jest.Mocked<Repository<User>>;
  let roleService: jest.Mocked<RoleService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: RoleService,
          useValue: {
            findByName: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));
    roleService = module.get(RoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all users', async () => {
    const mockUsers: User[] = [
      {
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
        age: 30,
        password: 'hashed',
        posts: [],
        roles: [],
      },
    ];
    userRepo.find.mockResolvedValue(mockUsers);
    const result = await service.findAll();
    expect(result).toEqual({ users: mockUsers });
  });

  it('should throw if user not found in setUserRole', async () => {
    userRepo.findOne.mockResolvedValue(null);
    await expect(service.setUserRole(1, [1])).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw if default role not found in setUserRole', async () => {
    const mockUser = {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      age: 30,
      password: 'hashed',
      posts: [],
      roles: [],
    } as User;

    userRepo.findOne.mockResolvedValue(mockUser);
    roleService.findByName.mockResolvedValue(null);

    await expect(service.setUserRole(1, [2])).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw if any role id is not found', async () => {
    const mockUser = {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      age: 30,
      password: 'hashed',
      posts: [],
      roles: [],
    } as User;

    const userRole = { id: 99, name: 'user', users: [] } as Role;

    userRepo.findOne.mockResolvedValue(mockUser);
    roleService.findByName.mockResolvedValue(userRole);
    roleService.findById.mockResolvedValue(null);

    await expect(service.setUserRole(1, [2])).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update user roles', async () => {
    const mockUser: User = {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      age: 30,
      password: 'hashed',
      posts: [],
      roles: [],
    };

    const userRole: Role = { id: 1, name: 'user', users: [] };
    const adminRole: Role = { id: 2, name: 'admin', users: [] };

    userRepo.findOne.mockResolvedValue(mockUser);
    roleService.findByName.mockResolvedValue(userRole);
    roleService.findById.mockResolvedValue(adminRole);

    const savedUser: User = {
      ...mockUser,
      roles: [userRole, adminRole],
    };

    userRepo.save.mockResolvedValue(savedUser);

    const result = await service.setUserRole(1, [2]);
    expect(typeof service.setUserRole).toBe('function');

    expect(result).toEqual(savedUser);
    expect(result.roles).toEqual([userRole, adminRole]);
    expect(userRepo.save.mock.calls[0][0]).toEqual(
      expect.objectContaining({ roles: [userRole, adminRole] }),
    );
  });

  it('should create default roles if not exist', async () => {
    roleService.findByName.mockImplementation(
      (name: string): Promise<Role | null> => {
        return Promise.resolve(
          name === 'admin' ? { id: 1, name: 'admin', users: [] } : null,
        );
      },
    );

    roleService.create.mockResolvedValue({ id: 2, name: 'user', users: [] });

    const loggerSpy = jest
      .spyOn(service['logger'], 'log')
      .mockImplementation(() => undefined);

    await service.initDefaultRoles();

    expect(roleService.findByName).toHaveBeenCalledWith('admin');
    expect(roleService.findByName).toHaveBeenCalledWith('user');
    expect(roleService.create).toHaveBeenCalledWith({ name: 'user' });
    expect(loggerSpy).toHaveBeenCalledWith('預設角色 "user" 已建立');
  });

  it.each([
    {
      desc: 'admin 不存在、user 不存在（都需建立）',
      findByNameMap: {
        admin: null,
        user: null,
      },
      expectedCreates: ['admin', 'user'],
    },
    {
      desc: 'admin 不存在、user 存在（只建立 admin）',
      findByNameMap: {
        admin: null,
        user: { id: 2, name: 'user', users: [] } as Role,
      },
      expectedCreates: ['admin'],
    },
    {
      desc: 'admin 存在、user 存在（都不建立）',
      findByNameMap: {
        admin: { id: 1, name: 'admin', users: [] } as Role,
        user: { id: 2, name: 'user', users: [] } as Role,
      },
      expectedCreates: [],
    },
  ])(
    'initDefaultRoles - $desc',
    async ({
      findByNameMap,
      expectedCreates,
    }: {
      findByNameMap: Record<string, Role | null>;
      expectedCreates: string[];
    }) => {
      roleService.findByName.mockImplementation(
        (name: string): Promise<Role | null> => {
          return Promise.resolve(findByNameMap[name] ?? null);
        },
      );

      const loggerSpy = jest
        .spyOn(service['logger'], 'log')
        .mockImplementation(() => undefined);

      roleService.create.mockImplementation(
        ({ name }: { name: string }): Promise<Role> => {
          return Promise.resolve({
            id: Math.floor(Math.random() * 1000),
            name,
            users: [],
          });
        },
      );

      await service.initDefaultRoles();

      for (const name of expectedCreates) {
        expect(roleService.create).toHaveBeenCalledWith({ name });
        expect(loggerSpy).toHaveBeenCalledWith(`預設角色 "${name}" 已建立`);
      }

      expect(roleService.create).toHaveBeenCalledTimes(expectedCreates.length);
    },
  );
});
