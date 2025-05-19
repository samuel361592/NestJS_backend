import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { RoleService } from 'src/role/role.service';

interface FlatUserDto {
  id: number;
  name: string;
  email: string;
  age: number;
  roles: string[];
}

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly roleService: RoleService,
  ) {}

  async onModuleInit(): Promise<void> {
    const roles = ['admin', 'user'];
    for (const name of roles) {
      const exists = await this.roleService.findByName(name);
      if (!exists) {
        await this.roleService.create({ name });
        console.log(`預設角色 "${name}" 已建立`);
      }
    }
  }

  async findAll(): Promise<{ users: FlatUserDto[] }> {
    const users = await this.userRepo.find({
      relations: ['roles'],
    });

    const result = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      age: u.age,
      roles: u.roles.map((r) => r.name),
    }));

    return { users: result };
  }

  async setUserRole(userId: number, roleName: string): Promise<FlatUserDto> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException('User not found');

    const targetRole = await this.roleService.findByName(roleName);
    const userRole = await this.roleService.findByName('user');

    if (!targetRole || !userRole) throw new NotFoundException('Role not found');

    const updatedRoles = new Map<string, Role>();
    user.roles.forEach((r) => updatedRoles.set(r.name, r));
    updatedRoles.set('user', userRole);
    updatedRoles.set(roleName, targetRole);

    user.roles = Array.from(updatedRoles.values());
    await this.userRepo.save(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      roles: user.roles.map((r) => r.name),
    };
  }
}
