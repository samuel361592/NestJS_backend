import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // 過期會自動擋下
      secretOrKey: 'my-secret-key', // 和你註冊 JwtModule 的 secret 一樣
    });
  }

  // 驗證成功會執行這個
  async validate(payload: any) {
    return { email: payload.email, name: payload.name, age: payload.age };
  }
}
