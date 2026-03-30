import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Specialization, StudyLevel } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateRegistrationDto {
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

  @IsOptional()
  @ApiProperty()
  facId?: string;

  @IsOptional()
  @ApiPropertyOptional()
  facName?: string;

  @IsOptional()
  @IsEnum(Specialization)
  @ApiProperty()
  specialization?: Specialization;

  @IsOptional()
  @IsBoolean()
  workshpOnly?: boolean;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    example: [
      '17f68aa3-a395-4f07-aa5a-504ce7da3463',
      'b4f9bd9c-8045-403d-bcbf-08f229a0e110',
    ],
  })
  @IsOptional()
  workshopIds: string[];

  @IsOptional()
  @ApiProperty({ example: '111222' })
  ticketNo: string;

  @IsOptional()
  @IsEnum(StudyLevel)
  @ApiPropertyOptional({ required: false, nullable: true })
  studyLevel?: StudyLevel;

  @IsOptional()
  @ApiPropertyOptional({ required: false, nullable: true })
  isPaid?: boolean;

  @IsOptional()
  @ApiProperty({ example: '111222' })
  shortcode?: string;

  @IsOptional()
  @ApiProperty({ example: '47790d60-40df-401c-9067-c702657ad953' })
  paidToId?: string;
}
