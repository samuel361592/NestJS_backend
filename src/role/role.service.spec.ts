import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoleService } from './role.service';
import { Role } from '../entities/role.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('RoleService', () => {
  let service: RoleService;
  let roleRepo: jest.Mocked<Repository<Role>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getRepositoryToken(Role),
          useValue: {
            find: jest.fn(),
            findOneBy: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    roleRepo = module.get(getRepositoryToken(Role));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all roles', async () => {
    const mockRoles: Role[] = [{ id: 1, name: 'admin', users: [] }];
    roleRepo.find.mockResolvedValue(mockRoles);
    const result = await service.findAll();
    expect(result).toEqual(mockRoles);
  });

  it('should return one role by ID', async () => {
    const mockRole = { id: 1, name: 'admin', users: [] } as Role;
    roleRepo.findOneBy.mockResolvedValue(mockRole);
    const result = await service.findOne(1);
    expect(result).toEqual(mockRole);
  });

  it('should throw if role not found by ID', async () => {
    roleRepo.findOneBy.mockResolvedValue(null);
    await expect(() => service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('should find role by name', async () => {
    const mockRole = { id: 1, name: 'user', users: [] } as Role;
    roleRepo.findOne.mockResolvedValue(mockRole);
    const result = await service.findByName('user');
    expect(result).toEqual(mockRole);
  });

  it('should create a new role', async () => {
    const dto = { name: 'newrole' };
    const newRole = { id: 2, name: 'newrole', users: [] } as Role;
    roleRepo.findOneBy.mockResolvedValue(null);
    roleRepo.create.mockReturnValue(newRole);
    roleRepo.save.mockResolvedValue(newRole);
    const result = await service.create(dto);
    expect(result).toEqual(newRole);
  });

  it('should throw if role already exists on create', async () => {
    roleRepo.findOneBy.mockResolvedValue({
      id: 1,
      name: 'admin',
      users: [],
    } as Role);
    await expect(() => service.create({ name: 'admin' })).rejects.toThrow(
      'Role already exists',
    );
  });

  it('should update a role', async () => {
    const existingRole = { id: 1, name: 'admin', users: [] } as Role;
    const updatedRole = { id: 1, name: 'superadmin', users: [] } as Role;
    roleRepo.findOneBy.mockResolvedValue(existingRole);
    roleRepo.save.mockResolvedValue(updatedRole);
    const result = await service.update(1, { name: 'superadmin' });
    expect(result).toEqual(updatedRole);
  });

  it('should remove a role', async () => {
    const roleToRemove = { id: 1, name: 'admin', users: [] } as Role;
    roleRepo.findOneBy.mockResolvedValue(roleToRemove);
    const removeSpy = jest
      .spyOn(roleRepo, 'remove')
      .mockResolvedValue(roleToRemove);
    await service.remove(1);
    expect(removeSpy).toHaveBeenCalledWith(roleToRemove);
  });
});
