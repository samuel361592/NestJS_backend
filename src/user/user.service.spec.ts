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

  const userRole = {
    id: 2,
    name: 'user',
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

  it('應回傳所有使用者角色', async () => {
    userRepo.find!.mockResolvedValue([{ ...sampleUser, roles: [sampleRole] }]);

    const result = await service.findAll();
    expect(result.users[0].roles).toEqual(['admin']);
  });

  describe('setUserRole', () => {
    it('若找不到使用者應拋出 NotFoundException', async () => {
      userRepo.findOne!.mockResolvedValue(null);
      await expect(service.setUserRole(1, 'admin')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('若找不到角色應拋出 NotFoundException', async () => {
      userRepo.findOne!.mockResolvedValue(sampleUser);
      roleRepo
        .findOne!.mockResolvedValueOnce(sampleRole) // targetRole
        .mockResolvedValueOnce(null); // userRole

      await expect(service.setUserRole(1, 'admin')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('應加入新角色若尚未存在', async () => {
      const userWithNoRoles = { ...sampleUser, roles: [] };
      userRepo.findOne!.mockResolvedValue(userWithNoRoles);
      roleRepo
        .findOne!.mockResolvedValueOnce(sampleRole) // admin
        .mockResolvedValueOnce(userRole); // user

      userRepo.save!.mockResolvedValue({
        ...userWithNoRoles,
        roles: [userRole, sampleRole],
      });

      const result = await service.setUserRole(1, 'admin');
      expect(result.roles).toContain('admin');
      expect(result.roles).toContain('user');
      expect(userRepo.save).toHaveBeenCalled();
    });

    it('若已擁有角色則不應再次儲存', async () => {
      const userWithRole = { ...sampleUser, roles: [sampleRole, userRole] };
      userRepo.findOne!.mockResolvedValue(userWithRole);
      roleRepo
        .findOne!.mockResolvedValueOnce(sampleRole) // admin
        .mockResolvedValueOnce(userRole); // user

      const result = await service.setUserRole(1, 'admin');
      expect(result.roles).toContain('admin');
      expect(result.roles).toContain('user');
      expect(userRepo.save).not.toHaveBeenCalled();
    });
  });
});
