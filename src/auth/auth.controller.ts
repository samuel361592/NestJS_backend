import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common'; // 常用的裝飾器
import { AuthService } from './auth.service'; // 匯入AuthService
import { AuthGuard } from '@nestjs/passport';

@Controller('auth') // 路由前綴，會變成 /auth
export class AuthController {
  constructor(private readonly authService: AuthService) {} // 注入 service

  // 定義 POST /auth/register
  @Post('register')
  register(
    @Body()
    body: {
      email: string;
      password: string;
      name: string;
      age: number;
    },
  ) {
    // 呼叫 service 的 register() 方法
    return this.authService.register(
      body.email,
      body.password,
      body.name,
      body.age,
    );
  }
  // 定義 POST /auth/login
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  // 受保護的API
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return { user: req.user };
  }
}
