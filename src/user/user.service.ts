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

  /** 啟動模組時自動建立預設角色 */
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

  /** 取得所有使用者（含 roles 關聯） */
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

  /**
   * 指派新角色給使用者：
   *   - 先載入 user + roles
   *   - 檢查是否已擁有該角色，若無則推入陣列並儲存 user
   */
  async setUserRole(userId: number, roleName: string) {
    // 1. 載入使用者與 roles
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. 找到要指派的角色實體
    const role = await this.roleRepo.findOne({ where: { name: roleName } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // 3. 若使用者尚未擁有此角色，則加入並儲存
    const alreadyHas = user.roles.some((r) => r.id === role.id);
    if (!alreadyHas) {
      user.roles.push(role);
      await this.userRepo.save(user);
    }

    // 4. 回傳最新角色列表
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      roles: user.roles.map((r) => r.name),
    };
  }

  /** 別名，方便 RESTful controller 呼叫 */
  async assignRole(userId: number, roleName: string) {
    return this.setUserRole(userId, roleName);
  }
}
