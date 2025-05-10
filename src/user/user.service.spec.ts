import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userRepo: Partial<Record<keyof Repository<User>, jest.Mock>>;
  let roleRepo: Partial<Record<keyof Repository<Role>, jest.Mock>>;

  const sampleUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    age: 20,
    roles: [],
    password: '',
    posts: [],
  } as User;

  const sampleRole = {
    id: 1,
    name: 'admin',
  } as Role;

  beforeEach(async () => {
    userRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    roleRepo = {
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Role), useValue: roleRepo },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should return all users with roles', async () => {
    userRepo.find!.mockResolvedValue([{ ...sampleUser, roles: [sampleRole] }]);

    const result = await service.findAll();
    expect(result.users[0].roles).toEqual(['admin']);
  });

  describe('setUserRole', () => {
    it('should throw NotFoundException if user not found', async () => {
      userRepo.findOne!.mockResolvedValue(null);
      await expect(service.setUserRole(1, 'admin')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if role not found', async () => {
      userRepo.findOne!.mockResolvedValue(sampleUser);
      roleRepo.findOne!.mockResolvedValue(null);
      await expect(service.setUserRole(1, 'admin')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should assign role if not already assigned', async () => {
      const userWithNoRoles = { ...sampleUser, roles: [] };
      userRepo.findOne!.mockResolvedValue(userWithNoRoles);
      roleRepo.findOne!.mockResolvedValue(sampleRole);
      userRepo.save!.mockResolvedValue({
        ...userWithNoRoles,
        roles: [sampleRole],
      });

      const result = await service.setUserRole(1, 'admin');
      expect(result.roles).toContain('admin');
      expect(userRepo.save).toHaveBeenCalled();
    });

    it('should not assign role again if already assigned', async () => {
      const userWithRole = { ...sampleUser, roles: [sampleRole] };
      userRepo.findOne!.mockResolvedValue(userWithRole);
      roleRepo.findOne!.mockResolvedValue(sampleRole);

      const result = await service.setUserRole(1, 'admin');
      expect(result.roles).toContain('admin');
      expect(userRepo.save).not.toHaveBeenCalled();
    });
  });
});
