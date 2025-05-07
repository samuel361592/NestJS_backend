import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
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

  async setUserRole(userId: number, roleName: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.roleRepo.findOne({ where: { name: roleName } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const alreadyHas = user.roles.some((r) => r.id === role.id);
    if (!alreadyHas) {
      user.roles.push(role);
      await this.userRepo.save(user);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      roles: user.roles.map((r) => r.name),
    };
  }

  async assignRole(userId: number, roleName: string) {
    return this.setUserRole(userId, roleName);
  }
}
