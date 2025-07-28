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
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ErrorCode } from 'src/common/errors/error-codes.enum';
import { RoleService } from 'src/role/role.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly roleService: RoleService,

    private readonly jwtService: JwtService,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<{ message: string; token: string }> {
    const { email, password, name, age } = dto;

    const exists = await this.userRepo.findOne({ where: { email } });
    if (exists) {
      throw new ConflictException({
        errorCode: ErrorCode.EmailAlreadyExists,
        message: '此信箱已被註冊，請使用其他信箱',
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      email,
      password: hashed,
      name,
      age,
      roles: [],
    });
    await this.userRepo.save(user);

    const payload: Express.User = {
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

  async login(dto: LoginDto): Promise<{ token: string }> {
    const { email, password } = dto;
    const user = await this.userRepo.findOne({
      where: { email },
      select: ['id', 'email', 'name', 'age', 'password'],
      relations: ['roles'],
    });
    if (!user) throw new UnauthorizedException('找不到使用者');
    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('密碼錯誤');
    }

    const payload: Express.User = {
      id: user.id,
      email: user.email,
      name: user.name,
      age: user.age,
      roles: user.roles.map((r) => r.name),
    };

    return { token: this.jwtService.sign(payload) };
  }

  async getProfile(userId: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException('找不到使用者');
    return user;
  }
}
