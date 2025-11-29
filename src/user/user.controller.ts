import {
  Controller,
  Get,
  Post,
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
  ApiBody,
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
import { CreateTestUserDto } from './dto/create-test-user.dto';

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
  @ApiBody({ type: CreateTestUserDto })
  @Post('test-create')
  @ApiOperation({ summary: '建立測試用戶（測試人員用）' })
  @ApiResponse({
    status: 201,
    description: '建立成功',
    schema: {
      example: {
        message: '建立成功',
        user: {
          id: 1,
          name: 'testuser',
          email: 'testuser@example.com',
          age: 25,
          roles: [{ id: 1, name: 'admin' }],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '建立失敗',
    schema: {
      example: {
        errorCode: ErrorCode.InvalidRegisterFormat,
        message: '註冊格式無效',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '系統錯誤',
    schema: {
      example: {
        errorCode: ErrorCode.InternalServerError,
        message: '內部伺服器錯誤',
      },
    },
  })
  async createTestUser(@Body() dto: CreateTestUserDto) {
    try {
      const user = await this.userService.createTestUser(dto);
      return { message: '建立成功', user };
    } catch (error) {
      let msg = '註冊格式無效';
      let errorCode = ErrorCode.InvalidRegisterFormat;
      let status = 400;

      if (error?.message?.includes('Duplicate entry')) {
        msg = '此信箱已被註冊，請使用其他信箱';
        errorCode = ErrorCode.EmailAlreadyExists;
      }

      if (error?.message?.includes('Role id')) {
        msg = '使用者不存在';
        errorCode = ErrorCode.UserNotFound;
      }

      if (!error?.message?.includes('Duplicate entry') && !error?.message?.includes('Role id')) {
        msg = '內部伺服器錯誤';
        errorCode = ErrorCode.InternalServerError;
        status = 500;
      }
      return {
        statusCode: status,
        errorCode,
        message: msg,
      };
    }
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
  @ApiResponse({
    status: 404,
    description: '找不到使用者或角色',
    schema: {
      example: {
        statusCode: 404,
        errorCode: '404-02-01-001',
        message: '找不到使用者或角色',
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
        errorCode: ErrorCode.SelfRoleModificationForbidden,
      });
    }

    const updatedUser = await this.userService.setUserRole(id, roleIds);
    return { message: '角色更新成功', updatedUser };

    
  }

}
