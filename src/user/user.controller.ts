import { Controller, Get, Patch, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';



@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    getAllUsers() {
        return this.userService.findAll();
    }

    @Patch(':id/role')
    @UseGuards(JwtAuthGuard)
    async setUserRole(
        @Param('id') id: number,
        @Body('role') role: string,
        @Request() req,
    ) {
        console.log('user role type =', typeof req.user.role, 'value =', req.user.role);

        // 👇 檢查呼叫者是不是 admin
        if (req.user.role?.trim().toLowerCase() !== 'admin') {
            throw new ForbiddenException('只有 admin 可以更改角色');
          }
          

        return this.userService.setUserRole(id, role);
    }
}