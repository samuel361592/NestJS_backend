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
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Request as ExpressRequest } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import { ErrorCode } from 'src/common/errors/error-codes.enum';
import { JwtPayload } from '../auth/jwt.strategy';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '取得所有使用者（僅限 admin）' })
  @ApiResponse({ status: 200, description: '成功取得所有使用者' })
  @ApiResponse({
    status: 403,
    description: '只有 admin 可以取得所有使用者',
    type: ErrorResponseDto,
    schema: {
      example: {
        errorCode: ErrorCode.UnauthorizedRoleChange,
        message: '只有 admin 可以取得所有使用者',
      },
    },
  })
  @Get()
  getAllUsers() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '設定使用者角色（僅限 admin）' })
  @ApiParam({ name: 'id', type: Number, description: '使用者 ID' })
  @ApiBody({
    schema: {
      example: {
        role: 'admin',
      },
    },
    description: '要設定的角色（如 admin / user）',
  })
  @ApiResponse({ status: 200, description: '成功修改使用者角色' })
  @ApiResponse({
    status: 403,
    description: '只有 admin 可以更改角色',
    type: ErrorResponseDto,
    schema: {
      example: {
        errorCode: ErrorCode.UnauthorizedRoleChange,
        message: '只有 admin 可以更改角色',
      },
    },
  })
  @Patch(':id/role')
  async setUserRole(
    @Param('id') id: number,
    @Body('role') role: string,
    @Request() req: ExpressRequest,
  ) {
    const user = req.user as JwtPayload;
    const isAdmin = user.roles?.includes('admin');

    if (!isAdmin) {
      throw new ForbiddenException({
        errorCode: ErrorCode.UnauthorizedRoleChange,
        message: '只有 admin 可以更改角色',
      });
    }

    return this.userService.setUserRole(id, role);
  }
}
