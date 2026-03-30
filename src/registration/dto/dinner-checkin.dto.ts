import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DinnerCheckin {
  @ApiProperty({ type: 'string', description: 'The ID of the Ticket' })
  @IsString()
  @IsNotEmpty()
  ticketNo: string;
}
