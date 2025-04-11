import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// JwtAuthGuard 繼承了 Passport 的 AuthGuard，並使用 'jwt' 策略來進行 JWT 驗證
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
