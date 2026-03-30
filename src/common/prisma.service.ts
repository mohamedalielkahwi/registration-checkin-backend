import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
    // {
    //   log: ['query'],
    // }
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      console.error(error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
