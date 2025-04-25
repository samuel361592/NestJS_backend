import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from './jwt.strategy';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ErrorCode } from 'src/common/errors/error-codes.enum';

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
    schema: {
      example: {
        message: '註冊成功',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '格式錯誤或欄位缺失',
    schema: {
      example: {
        statusCode: 400,
        errorCode: '400-01-01-003',
        message: '信箱、密碼、名稱等欄位格式錯誤',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: '信箱已註冊',
    schema: {
      example: {
        statusCode: 409,
        errorCode: '409-01-01-001',
        message: '此信箱已被註冊，請使用其他信箱',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '伺服器錯誤',
    schema: {
      example: {
        statusCode: 500,
        errorCode: '500-01-01-004',
        message: '無法處理註冊請求，請稍後再試',
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
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
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
  @ApiResponse({
    status: 500,
    description: '伺服器錯誤',
    schema: {
      example: {
        statusCode: 500,
        errorCode: ErrorCode.InternalServerError,
        message: '登入處理失敗，請稍後再試',
      },
    },
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '取得登入使用者的資料' })
  @ApiBearerAuth()
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
  getProfile(@Request() req: Request & { user: JwtPayload }) {
    return { user: req.user };
  }
}
