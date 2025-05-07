import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ForbiddenException } from '@nestjs/common';
import { JwtPayload } from '../auth/jwt.strategy';
import { Request as ExpressRequest } from 'express';

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: { findAll: jest.Mock; setUserRole: jest.Mock };

  const mockRequest = (user: JwtPayload): ExpressRequest => {
    return {
      user,
    } as unknown as ExpressRequest;
  };

  beforeEach(async () => {
    mockUserService = {
      findAll: jest.fn(),
      setUserRole: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should return all users (admin only)', async () => {
    const users = [{ id: 1, email: 'admin@example.com' }];
    mockUserService.findAll.mockResolvedValue(users);

    const result = await controller.getAllUsers();
    expect(result).toEqual(users);
  });

  describe('setUserRole', () => {
    const adminUser: JwtPayload = {
      id: 1,
      email: 'admin@example.com',
      name: 'Admin',
      age: 30,
      roles: ['admin'],
      iat: 0,
      exp: 0,
    };

    const normalUser: JwtPayload = {
      id: 2,
      email: 'user@example.com',
      name: 'User',
      age: 25,
      roles: ['user'],
      iat: 0,
      exp: 0,
    };

    it('should throw ForbiddenException if user is not admin', async () => {
      await expect(
        controller.setUserRole(3, 'admin', mockRequest(normalUser)),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should call userService.setUserRole if user is admin', async () => {
      mockUserService.setUserRole.mockResolvedValue({
        message: 'Role updated',
      });

      const result = await controller.setUserRole(
        3,
        'admin',
        mockRequest(adminUser),
      );
      expect(result).toEqual({ message: 'Role updated' });
      expect(mockUserService.setUserRole).toHaveBeenCalledWith(3, 'admin');
    });
  });
});
