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
    await expect(service.setUserRole(1, 'admin')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw if role not found in setUserRole', async () => {
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
    roleService.findByName.mockResolvedValueOnce(null);
    await expect(service.setUserRole(1, 'admin')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update user roles', async () => {
    const mockUser = {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      age: 30,
      password: 'hashed',
      posts: [],
      roles: [],
    } as User;

    const mockRole = { id: 1, name: 'user', users: [] } as Role;

    userRepo.findOne.mockResolvedValue(mockUser);
    roleService.findByName.mockResolvedValue(mockRole);
    userRepo.save.mockResolvedValue(mockUser);

    const result = await service.setUserRole(1, 'user');
    expect(result).toBe(mockUser);
  });
});
