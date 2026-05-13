import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { EmployeesService } from 'src/employees/employees.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly employeeService: EmployeesService) {
    super({
      jwtFromRequest: (req) => {
        return req?.cookies?.access_token;
      },
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }
  async validate(payload) {
    const user = await this.employeeService.findOne(payload.sub);
    if (user?.tokenVersion !== payload.version) {
      throw new UnauthorizedException('Token is stale');
    }
    return payload;
  }
}
