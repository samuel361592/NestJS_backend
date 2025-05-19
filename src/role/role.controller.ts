import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiParam,
} from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from '../entities/role.entity';

@ApiTags('Role')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: '取得所有角色' })
  @ApiOkResponse({
    description: '成功回傳所有角色資料',
    type: Role,
    isArray: true,
  })
  @Get()
  findAll(): Promise<Role[]> {
    return this.roleService.findAll();
  }

  @ApiOperation({ summary: '取得單一角色' })
  @ApiParam({ name: 'id', description: '角色 ID' })
  @ApiOkResponse({
    description: '成功回傳指定角色資料',
    type: Role,
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Role> {
    return this.roleService.findOne(+id);
  }

  @ApiOperation({ summary: '新增角色' })
  @ApiCreatedResponse({
    description: '成功建立角色',
    type: Role,
  })
  @Post()
  create(@Body() dto: CreateRoleDto): Promise<Role> {
    return this.roleService.create(dto);
  }

  @ApiOperation({ summary: '更新角色' })
  @ApiParam({ name: 'id', description: '要更新的角色 ID' })
  @ApiOkResponse({
    description: '成功更新角色',
    type: Role,
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto): Promise<Role> {
    return this.roleService.update(+id, dto);
  }

  @ApiOperation({ summary: '刪除角色' })
  @ApiParam({ name: 'id', description: '要刪除的角色 ID' })
  @ApiNoContentResponse({ description: '成功刪除角色' })
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.roleService.remove(+id);
  }
}
