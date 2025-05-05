import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ErrorCode } from 'src/common/errors/error-codes.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    private readonly jwtService: JwtService,
  ) {}

  /** 註冊：直接把 user.roles 設為 [role] */
  async register(dto: RegisterDto) {
    const { email, password, name, age } = dto;

    if (await this.userRepository.findOne({ where: { email } })) {
      throw new ConflictException({
        errorCode: ErrorCode.EmailAlreadyExists,
        message: '此信箱已被註冊，請使用其他信箱',
      });
    }

    const role = await this.roleRepository.findOne({
      where: { name: 'user' },
    });
    if (!role) {
      throw new NotFoundException('找不到 user 角色，請先建立角色');
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashed,
      name,
      age,
      roles: [role], // ← 這裡直接關聯
    });
    await this.userRepository.save(user);

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      age: user.age,
      roles: user.roles.map((r) => r.name),
    };
    return {
      message: '註冊成功',
      token: this.jwtService.sign(payload),
    };
  }

  /** 登入：relations: ['roles'] */
  async login(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'name', 'age', 'password'],
      relations: ['roles'],
    });
    if (!user) throw new UnauthorizedException('找不到使用者');
    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('密碼錯誤');
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      age: user.age,
      roles: user.roles.map((r) => r.name),
    };
    return { token: this.jwtService.sign(payload) };
  }

  /** 取得 profile，同樣用 relations: ['roles'] */
  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException('找不到使用者');
    return user;
  }
}
