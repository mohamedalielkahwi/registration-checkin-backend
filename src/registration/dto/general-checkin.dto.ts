import { ApiProperty } from '@nestjs/swagger';
import { IsAlpha, IsDecimal, IsNotEmpty, IsUUID, Length } from 'class-validator';

export class GeneralCheckinDto {
  @IsNotEmpty()
  @ApiProperty()
  ticketNo: string;
}

export class ShortCodeCheckinDto {
  @IsNotEmpty()
  @IsDecimal()
  @Length(6,6)
  shortCode: string;
}