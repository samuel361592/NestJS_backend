import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
  ) {}

  async onModuleInit() {
    const roles = ['admin', 'user'];
    for (const name of roles) {
      const exists = await this.roleRepo.findOneBy({ name });
      if (!exists) {
        await this.roleRepo.save({ name });
        console.log(`預設角色 "${name}" 已建立`);
      }
    }
  }

  async findAll() {
    const users = await this.userRepo.find({
      relations: ['userRoles', 'userRoles.role'],
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      roles: user.userRoles.map((ur) => ur.role.name),
    }));
  }

  async setUserRole(userId: number, roleName: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role'],
    });
    if (!user) throw new NotFoundException('User not found');

    const role = await this.roleRepo.findOne({ where: { name: roleName } });
    if (!role) throw new NotFoundException('Role not found');

    const alreadyHas = user.userRoles.some((ur) => ur.role.id === role.id);
    if (!alreadyHas) {
      const userRole = this.userRoleRepo.create({ user, role });
      await this.userRoleRepo.save(userRole);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      roles: user.userRoles.map((ur) => ur.role.name).concat(role.name), // 新增後的結果
    };
  }

  async assignRole(userId: number, roleName: string) {
    return this.setUserRole(userId, roleName);
  }
}
