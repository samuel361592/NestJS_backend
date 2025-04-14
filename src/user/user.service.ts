// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // 查詢所有使用者（含角色）
  findAll() {
    return this.userRepo.find({
      relations: ['role'], // 若有角色資訊
      select: ['id', 'name', 'email', 'age'], // 不包含密碼
    });
  }
}
