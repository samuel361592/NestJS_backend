import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConflictException } from '@nestjs/common';
import { ErrorCode } from 'src/common/errors/error-codes.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, password, name, age } = dto;

    const exist = await this.userRepository.findOne({ where: { email } });
    if (exist) {
      throw new ConflictException({
        errorCode: ErrorCode.EmailAlreadyExists,
        message: '此信箱已被註冊，請使用其他信箱',
      } as any);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const role = await this.roleRepository.findOne({ where: { name: 'user' } });
    if (!role) throw new NotFoundException('找不到 user 角色，請先建立角色');

    const user = await this.userRepository.save({
      email,
      name,
      age,
      password: hashedPassword,
    });

    const userRole = this.userRoleRepository.create({ user, role });
    await this.userRoleRepository.save(userRole);

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      age: user.age,
      role: 'user',
    };

    const token = this.jwtService.sign(payload);
    return {
      message: '註冊成功',
      token,
    };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'name', 'age', 'password'],
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) throw new UnauthorizedException('找不到使用者');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('密碼錯誤');

    const roles = user.userRoles.map((ur) => ur.role.name);

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      age: user.age,
      role: roles[0] || 'user',
    };

    const token = this.jwtService.sign(payload);
    return { token };
  }
}
