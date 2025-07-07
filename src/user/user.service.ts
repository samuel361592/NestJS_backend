import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { RoleService } from 'src/role/role.service';

@Injectable()
export class UserService implements OnModuleInit {
  private readonly logger = new Logger(UserService.name);

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
        this.logger.log(`預設角色 "${name}" 已建立`);
      }
    }
  }

  async findAll(): Promise<{ users: User[] }> {
    const users = await this.userRepo.find({
      relations: ['roles'],
    });

    return { users };
  }

  async setUserRole(userId: number, roleIds: number[]): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException('User not found');

    const roles: Role[] = [];

    const userRole = await this.roleService.findByName('user');
    if (!userRole) throw new NotFoundException('Default role "user" not found');
    roles.push(userRole);

    for (const roleId of roleIds) {
      const role = await this.roleService.findById(roleId);
      if (!role) throw new NotFoundException(`Role id ${roleId} not found`);
      roles.push(role);
    }

    const uniqueRoles = Array.from(
      new Map(roles.map((r) => [r.id, r])).values(),
    );
    user.roles = uniqueRoles;

    await this.userRepo.save(user);
    return user;
  }

  async initDefaultRoles(): Promise<void> {
    const roles = ['admin', 'user'];
    for (const name of roles) {
      const exists = await this.roleService.findByName(name);
      if (!exists) {
        await this.roleService.create({ name });
        this.logger.log(`預設角色 "${name}" 已建立`);
      }
    }
  }
}
