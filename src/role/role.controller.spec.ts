import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from '../entities/role.entity';

const mockRole: Role = {
  id: 1,
  name: 'admin',
  users: [],
};

describe('RoleController', (): void => {
  let controller: RoleController;
  const mockRoleService: Partial<Record<keyof RoleService, jest.Mock>> = {
    findAll: jest.fn().mockResolvedValue([mockRole]),
    findOne: jest.fn().mockResolvedValue(mockRole),
    create: jest.fn().mockResolvedValue(mockRole),
    update: jest.fn().mockResolvedValue({ ...mockRole, name: 'updated' }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: mockRoleService,
        },
      ],
    }).compile();

    controller = module.get<RoleController>(RoleController);
  });

  it('should be defined', (): void => {
    expect(controller).toBeDefined();
  });

  it('should return all roles', async (): Promise<void> => {
    (mockRoleService.findAll as jest.Mock).mockResolvedValueOnce([mockRole]);
    const result: Role[] = await controller.findAll();
    expect(result).toEqual([mockRole]);
    expect(mockRoleService.findAll).toHaveBeenCalled();
  });

  it('should return one role', async (): Promise<void> => {
    (mockRoleService.findOne as jest.Mock).mockResolvedValueOnce(mockRole);
    const result: Role = await controller.findOne('1');
    expect(result).toEqual(mockRole);
    expect(mockRoleService.findOne).toHaveBeenCalledWith(1);
  });

  it('should create a new role', async (): Promise<void> => {
    const dto: CreateRoleDto = { name: 'admin' };
    (mockRoleService.create as jest.Mock).mockResolvedValueOnce(mockRole);
    const result: Role = await controller.create(dto);
    expect(result).toEqual(mockRole);
    expect(mockRoleService.create).toHaveBeenCalledWith(dto);
  });

  it('should update a role', async (): Promise<void> => {
    const dto: UpdateRoleDto = { name: 'updated' };
    const updated: Role = { ...mockRole, name: 'updated' };
    (mockRoleService.update as jest.Mock).mockResolvedValueOnce(updated);
    const result: Role = await controller.update('1', dto);
    expect(result).toEqual(updated);
    expect(mockRoleService.update).toHaveBeenCalledWith(1, dto);
  });

  it('should remove a role', async (): Promise<void> => {
    (mockRoleService.remove as jest.Mock).mockResolvedValueOnce(undefined);
    const result: void = await controller.remove('1');
    expect(result).toBeUndefined();
    expect(mockRoleService.remove).toHaveBeenCalledWith(1);
  });
});
