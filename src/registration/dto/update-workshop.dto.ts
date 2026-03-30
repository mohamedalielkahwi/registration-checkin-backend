import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IsArray, IsOptional } from 'class-validator';
export class UpdateWorkshopDto {
    @ApiProperty()
    @IsNotEmpty()
    email: string;
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
}