import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtPayload } from './jwt.strategy';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ErrorCode } from 'src/common/errors/error-codes.enum';
import { Request as ExpressRequest } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '使用者註冊' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: '註冊成功',
    schema: { example: { message: '註冊成功', token: '<JWT>' } },
  })
  @ApiResponse({
    status: 409,
    description: '信箱已註冊',
    schema: {
      example: {
        statusCode: 409,
        errorCode: ErrorCode.EmailAlreadyExists,
        message: '此信箱已被註冊，請使用其他信箱',
      },
    },
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: '使用者登入' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: '登入成功，回傳 access_token',
    schema: { example: { token: '<JWT>' } },
  })
  @ApiResponse({
    status: 401,
    description: '帳號或密碼錯誤',
    schema: {
      example: {
        statusCode: 401,
        errorCode: ErrorCode.InvalidCredentials,
        message: '帳號或密碼錯誤',
      },
    },
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取得登入使用者的資料' })
  @ApiResponse({
    status: 200,
    description: '取得使用者資訊',
    schema: {
      example: {
        user: {
          id: 1,
          email: 'user@example.com',
          name: 'Samuel',
          age: 25,
          roles: ['admin'],
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '未授權或 token 無效',
    schema: {
      example: {
        statusCode: 401,
        errorCode: ErrorCode.TokenMissing,
        message: '請提供有效的 JWT token',
      },
    },
  })
  async getProfile(
    @Request() req: ExpressRequest & { user: JwtPayload },
  ): Promise<{
    user: {
      id: number;
      email: string;
      name: string;
      age: number;
      roles: string[];
    };
  }> {
    const userEntity = await this.authService.getProfile(req.user.id);
    return {
      user: {
        id: userEntity.id,
        email: userEntity.email,
        name: userEntity.name,
        age: userEntity.age,
        roles: userEntity.roles.map((r) => r.name),
      },
    };
  }
}
