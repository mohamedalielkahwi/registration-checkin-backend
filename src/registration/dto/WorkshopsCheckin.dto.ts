import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class WorkshopCheckinDto {
  @IsNotEmpty()
  @ApiProperty()
  ticketNo: string;

  @IsNotEmpty()
  @ApiProperty()
  workshopId: string;
}
