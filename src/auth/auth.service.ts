import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) {}

    async register(email: string, password: string, name: string, age: number) {
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            throw new Error('請輸入有效的 Email');
        }

        if (password.length < 8 || password.length > 60) {
            throw new Error('密碼長度需介於 8~60 字元');
        }

        const exist = await this.userRepository.findOne({ where: { email } });
        if (exist) throw new Error('信箱已註冊');

        const hashedPassword = await bcrypt.hash(password, 10);

        await this.userRepository.save({
            email,
            name,
            age,
            password: hashedPassword,
        });

        return { message: '註冊成功' };
    }

    async login(email: string, password: string) {
        const user = await this.userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'name', 'age', 'password'],
        });
        if (!user) throw new UnauthorizedException('找不到使用者');

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) throw new UnauthorizedException('密碼錯誤');

        const payload = { id: user.id, email: user.email, name: user.name, age: user.age };
        const token = this.jwtService.sign(payload);

        return { token };
    }
}
