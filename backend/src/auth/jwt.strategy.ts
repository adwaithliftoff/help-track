import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        return req?.cookies?.access_token;
      },
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }
  async validate(payload) {
    return payload;
  }
}
