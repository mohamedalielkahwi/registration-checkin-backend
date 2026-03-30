import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class MarkPaid {
  @ApiProperty({ type: 'string', description: 'Email of the attendee' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: 'string', description: 'ID of the admin marking as paid' })
  @IsNotEmpty()
  adminId: string;
}
