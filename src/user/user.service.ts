import {
  Injectable,
  NotFoundException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { RoleService } from 'src/role/role.service';
import { CreateTestUserDto } from './dto/create-test-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.initDefaultRoles();
  }

  /** 預設角色初始化邏輯 */
  async initDefaultRoles(): Promise<void> {
    const admin = await this.roleService.findByName('admin');
    if (!admin) {
      await this.roleService.create({ name: 'admin' });
      this.logger.log('預設角色 "admin" 已建立');
    }
    const user = await this.roleService.findByName('user');
    if (!user) {
      await this.roleService.create({ name: 'user' });
      this.logger.log('預設角色 "user" 已建立');
    }
  }
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly roleService: RoleService,
  ) {}


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

    for (const roleId of roleIds) {
      const role = await this.roleService.findById(roleId);
      if (!role) throw new NotFoundException(`Role id ${roleId} not found`);
      roles.push(role);
    }

    user.roles = roles;

    await this.userRepo.save(user);
    return user;
  }

  async createTestUser(dto: CreateTestUserDto): Promise<User> {
  const roles: Role[] = [];
  const hashedPassword = await bcrypt.hash(dto.password, 10);
  for (const roleId of dto.roleIds) {
    const role = await this.roleService.findById(roleId);
    if (role) roles.push(role);
  }
  const user = this.userRepo.create({
    name: dto.name,
    email: dto.email,
    password: hashedPassword,
    age: dto.age,
    roles,
  });
  return await this.userRepo.save(user);
  }
}
