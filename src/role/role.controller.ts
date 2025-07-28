import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiBearerAuth,
  ApiResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from '../entities/role.entity';
import { IdParamDto } from './dto/id-param.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../common/guards/roles.guard';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { ErrorCode } from '../common/errors/error-codes.enum';

@ApiTags('Role')
@ApiBearerAuth('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: '取得所有角色（僅限 admin）' })
  @ApiOkResponse({
    description: '成功回傳所有角色資料',
    type: Role,
    isArray: true,
  })
  @ApiResponse({
    status: 403,
    description: '只有 admin 可以查看所有角色',
    type: ErrorResponseDto,
    schema: {
      example: {
        errorCode: ErrorCode.UnauthorizedRoleChange,
        message: '只有 admin 可以查看所有角色',
      },
    },
  })
  findAll(): Promise<Role[]> {
    return this.roleService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: '取得單一角色（僅限 admin）' })
  @ApiParam({ name: 'id', description: '角色 ID' })
  @ApiOkResponse({
    description: '成功回傳指定角色資料',
    type: Role,
  })
  @ApiNotFoundResponse({
    description: '找不到角色',
    schema: {
      example: {
        statusCode: 404,
        errorCode: ErrorCode.UserNotFound,
        message: '找不到角色',
      },
    },
  })
  findOne(@Param() params: IdParamDto): Promise<Role> {
    return this.roleService.findOne(params.id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: '新增角色（僅限 admin）' })
  @ApiCreatedResponse({
    description: '成功建立角色',
    type: Role,
  })
  create(@Body() dto: CreateRoleDto): Promise<Role> {
    return this.roleService.create(dto);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: '更新角色（僅限 admin）' })
  @ApiParam({ name: 'id', description: '要更新的角色 ID' })
  @ApiOkResponse({
    description: '成功更新角色',
    type: Role,
  })
  @ApiNotFoundResponse({
    description: '找不到角色',
    schema: {
      example: {
        statusCode: 404,
        errorCode: ErrorCode.UserNotFound,
        message: '找不到角色',
      },
    },
  })
  update(
    @Param() params: IdParamDto,
    @Body() dto: UpdateRoleDto,
  ): Promise<Role> {
    return this.roleService.update(params.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '刪除角色（僅限 admin）' })
  @ApiResponse({
    status: 200,
    description: '成功刪除角色',
    schema: {
      example: { id: 3, name: 'editor' },
    },
  })
  @ApiNotFoundResponse({
    description: '找不到角色',
    schema: {
      example: {
        statusCode: 404,
        errorCode: ErrorCode.UserNotFound,
      },
    },
  })
  async deleteRole(@Param('id') id: number): Promise<Role> {
    const deleted = await this.roleService.remove(id);
    return deleted;
  }
}
