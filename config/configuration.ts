import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Config {
  constructor(private readonly configService: ConfigService) {}

  getDatabaseUser(): string {
    return this.configService.get<string>('DATABASE_USER');
  }
}
