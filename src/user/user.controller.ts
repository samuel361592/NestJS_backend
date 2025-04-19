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

interface JwtPayload {
  id: number;
  email: string;
  roles: string[];
}

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  getAllUsers() {
    return this.userService.findAll();
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard)
  async setUserRole(
    @Param('id') id: number,
    @Body('role') role: string,
    @Request() req: ExpressRequest,
  ) {
    const user = req.user as JwtPayload;

    console.log('user roles =', user.roles);

    const isAdmin = user.roles?.some(r => r.trim().toLowerCase() === 'admin');
    if (!isAdmin) {
      throw new ForbiddenException('只有 admin 可以更改角色');
    }

    return this.userService.setUserRole(id, role);
  }
}
