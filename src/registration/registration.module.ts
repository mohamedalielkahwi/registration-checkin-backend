import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        // host: 'smtp.outlook.com',
        host: 'smtp.gmail.com',
        port: Number(process.env.MAIL_PORT)||587,
        secure: false,

        auth: {
          user: process.env.MAILDEV_INCOMING_USER,
          pass: process.env.MAILDEV_INCOMING_PASS,
        },
      },
    }),
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService, PrismaService],
  exports: [RegistrationService],
})
export class RegistrationModule {}
