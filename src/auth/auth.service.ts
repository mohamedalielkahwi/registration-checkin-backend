import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  login(code: string) {
    if (code === process.env.MIC_CODE) {
      const token = jwt.sign({ code }, process.env.JWT_SECRET_KEY);
      return token;
    }
    throw new UnauthorizedException(' Wrong code Habibyy !');
  }
}
