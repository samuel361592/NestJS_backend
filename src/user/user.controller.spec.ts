import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Request } from 'express';
import { IdDto } from './dto/id.dto';
import { SetRoleDto } from './dto/set-role.dto';
import { ForbiddenException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    findAll: jest.fn().mockResolvedValue({
      users: [
        {
          id: 1,
          name: 'Alice',
          email: 'alice@example.com',
          age: 30,
          roles: [
            { id: 1, name: 'admin' },
            { id: 2, name: 'user' },
          ],
        },
      ],
    }),
    setUserRole: jest.fn().mockResolvedValue({
      id: 2,
      name: 'Bob',
      email: 'bob@example.com',
      roles: [{ id: 1, name: 'admin' }],
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should return all users', async () => {
    const result = await controller.getAllUsers();
    expect(result.users).toHaveLength(1);
    expect(mockUserService.findAll).toHaveBeenCalled();
  });

  it('should allow admin to set role', async () => {
    const idDto: IdDto = { id: 2 };
    const setRoleDto: SetRoleDto = { roleIds: [1] };
    const mockRequest = {
      user: {
        id: 1,
        roles: ['admin'],
      },
    } as unknown as Request;

    const result = await controller.setUserRole(idDto, setRoleDto, mockRequest);
    expect(result).toEqual({
      message: '角色更新成功',
      updatedUser: {
        id: 2,
        name: 'Bob',
        email: 'bob@example.com',
        roles: [{ id: 1, name: 'admin' }],
      },
    });
    expect(mockUserService.setUserRole).toHaveBeenCalledWith(2, [1]);
  });

  it('should not allow non-admin to set role', async () => {
    const idDto: IdDto = { id: 2 };
    const setRoleDto: SetRoleDto = { roleIds: [1] };
    const mockRequest = {
      user: {
        id: 1,
        roles: ['user'],
      },
    } as unknown as Request;

    await expect(
      controller.setUserRole(idDto, setRoleDto, mockRequest),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should not allow admin to set their own role', async () => {
    const idDto: IdDto = { id: 1 };
    const setRoleDto: SetRoleDto = { roleIds: [1] };
    const mockRequest = {
      user: {
        id: 1,
        roles: ['admin'],
      },
    } as unknown as Request;

    await expect(
      controller.setUserRole(idDto, setRoleDto, mockRequest),
    ).rejects.toThrow(ForbiddenException);
  });
});
