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

  // 啟動時自動建立預設角色
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

  // 查詢所有使用者（回傳乾淨資料）
  async findAll() {
    const users = await this.userRepo.find({ relations: ['role'] });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      role: user.role?.name, // 只回傳角色名稱，不含 id
    }));
  }

  // 指定角色給使用者（支援 admin/user）
  async setUserRole(userId: number, roleName: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role'],
    });
    if (!user) throw new NotFoundException('User not found');

    const role = await this.roleRepo.findOne({ where: { name: roleName } });
    if (!role) throw new NotFoundException('Role not found');

    user.role = role;
    await this.userRepo.save(user); // ✅ 儲存後不要回傳原始物件

    // ✅ 手動回傳乾淨格式
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      role: role.name, // ✅ 只回傳名稱，不回傳 id
    };
  }

  async assignRole(userId: number, roleName: string) {
    return this.setUserRole(userId, roleName); // 呼叫共用邏輯
  }
}
