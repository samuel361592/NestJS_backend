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

  async setUserRole(userId: number, roleName: string): Promise<User> {
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

    return user;
  }
}
