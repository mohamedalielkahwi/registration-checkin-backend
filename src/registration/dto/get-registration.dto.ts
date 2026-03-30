import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/PaginationDto';

export class GetRegistrationsDto extends PaginationDto {
  @IsOptional()
  @ApiPropertyOptional()
  search: string;
}
