import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../common/guards/roles.guard';
import { Request as ExpressRequest } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ErrorCode } from 'src/common/errors/error-codes.enum';
import { JwtPayload } from '../auth/jwt.strategy';
import { User } from '../entities/user.entity';
import { IdDto } from './dto/id.dto';
import { SetRoleDto } from './dto/set-role.dto';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('admin')
  @ApiOperation({ summary: '取得所有使用者（僅限 admin）' })
  @ApiResponse({
    status: 200,
    description: '成功取得所有使用者',
    schema: {
      example: {
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
          {
            id: 2,
            name: 'Bob',
            email: 'bob@example.com',
            age: 28,
            roles: [{ id: 2, name: 'user' }],
          },
          {
            id: 3,
            name: 'Charlie',
            email: 'charlie@example.com',
            age: 35,
            roles: [{ id: 3, name: 'editor' }],
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '只有 admin 可以取得所有使用者',
    schema: {
      example: {
        statusCode: 403,
        errorCode: '403-02-01-001',
        message: '只有 admin 可以取得所有使用者',
      },
    },
  })
  @Get()
  getAllUsers(): Promise<{ users: User[] }> {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('admin')
  @ApiOperation({ summary: '設定使用者角色（僅限 admin）' })
  @ApiParam({ name: 'id', type: Number, description: '目標使用者 ID' })
  @ApiResponse({
    status: 200,
    description: '成功修改使用者角色',
    schema: {
      example: {
        message: '角色更新成功',
        updatedUser: {
          id: 1,
          name: 'Alice',
          email: 'alice@example.com',
          roles: [
            { id: 1, name: 'admin' },
            { id: 2, name: 'user' },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '權限不足或禁止操作自身角色',
    schema: {
      example: {
        statusCode: 403,
        errorCode: '403-02-01-001',
        message: '只有 admin 可以更改角色',
      },
    },
  })
  @Patch(':id/roles')
  async setUserRole(
    @Param() { id }: IdDto,
    @Body() { roleIds }: SetRoleDto,
    @Request() req: ExpressRequest,
  ): Promise<{ message: string; updatedUser: any }> {
    const user = req.user as JwtPayload;
    const isAdmin = user.roles?.includes('admin');
    if (!isAdmin) {
      throw new ForbiddenException({
        errorCode: ErrorCode.UnauthorizedRoleChange,
        message: '只有 admin 可以更改角色',
      });
    }
    if (user.id === id) {
      throw new ForbiddenException({
        errorCode: ErrorCode.UnauthorizedRoleChange,
        message: '不可修改自己的角色',
      });
    }

    const updatedUser = await this.userService.setUserRole(id, roleIds);
    return { message: '角色更新成功', updatedUser };
  }
}
