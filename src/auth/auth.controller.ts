import { Body, Controller, Post } from '@nestjs/common'; // 常用的裝飾器
import { AuthService } from './auth.service'; // 匯入剛剛寫的 AuthService

@Controller('auth') // 路由前綴，會變成 /auth
export class AuthController {
  constructor(private readonly authService: AuthService) {} // 注入 service

  // 定義 POST /auth/register
  @Post('register')
  register(
    @Body() body: { email: string; password: string; name: string; age: number },
  ) {
    // 呼叫 service 的 register() 方法
    return this.authService.register(
      body.email,
      body.password,
      body.name,
      body.age,
    );
  }
}
