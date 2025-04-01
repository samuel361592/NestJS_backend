import { Injectable, UnauthorizedException } from '@nestjs/common'; // NestJS 提供的依賴注入工具
import * as bcrypt from 'bcrypt'; // 密碼加密工具
import { JwtService } from '@nestjs/jwt';

// 定義一個 User 型別 (模擬資料庫用)
interface User {
    email: string;    // 帳號 (信箱)
    name: string;     // 使用者名稱
    age: number;      // 年齡
    password: string; // 密碼 (要存加密過的)
}

@Injectable() // 可被注入的服務
export class AuthService {
    // 假裝這是一個資料庫，實際上是存在記憶體的陣列
    private users: User[] = [];

    constructor(private jwtService: JwtService) {}

    // 註冊功能
    async register(email: string, password: string, name: string, age: number) {
        // 帳號格式檢查
        // 規則: (/ / 正則表達式的開頭和結尾)
        // ^       -> 從字串開頭開始檢查
        // \S+     -> 至少一個非空白字元 (帳號部分)
        // @       -> 必須包含一個 @
        // \S+     -> 至少一個非空白字元 (domain 部分)
        // \.      -> 必須包含一個 . (點號)
        // \S+     -> 至少一個非空白字元 (例如 com、net、tw)
        // $       -> 字串結尾 (確保結尾正好停在最後的字元)
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            throw new Error('請輸入有效的 Email');
        }

        // 密碼長度檢查
        if (password.length < 8 || password.length > 60) {
            throw new Error('密碼長度需介於 8~60 字元');
        }

        // 使用 bcrypt 對密碼進行單向加密
        const hashedPassword = await bcrypt.hash(password, 10);

        // 將使用者資料存進 users 陣列 (假裝是資料庫 insert)
        this.users.push({
            email,
            name,
            age,
            password: hashedPassword, // 注意：這裡存的是加密過的密碼
        });

        // 回傳註冊成功訊息
        return { message: '註冊成功' };
    }
    async login(email: string, password: string) {
        // 找使用者
        const user = this.users.find(u => u.email === email);
        if (!user) throw new UnauthorizedException('找不到使用者');
    
        // 比對密碼
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new UnauthorizedException('密碼錯誤');
    
        // 產生 JWT token
        const payload = { email: user.email, name: user.name, age: user.age };
        const token = this.jwtService.sign(payload);
    
        return { token };
      }

}
