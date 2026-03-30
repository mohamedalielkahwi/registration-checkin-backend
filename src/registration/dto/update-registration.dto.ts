import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class UpdateRegistrationDto {
  @IsString()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @Matches(/^[0-9]{8}$/, { message: 'Phone number must be 8 digits' })
  @ApiProperty()
  phone: string;

  @IsOptional()
  @ApiProperty({ example: '47790d60-40df-401c-9067-c702657ad953' })
  teamId?: string;

  @IsOptional()
  @ApiPropertyOptional()
  teamName?: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    example: [
      '17f68aa3-a395-4f07-aa5a-504ce7da3463',
      'b4f9bd9c-8045-403d-bcbf-08f229a0e110',
    ],
  })
  workshopIds: string[];
}
