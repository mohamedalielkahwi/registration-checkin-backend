import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class WorkshopResponse {
  @Expose()
  @ApiProperty({ type: 'string', description: 'The ID of the workshop' })
  id: string;

  @Expose()
  @ApiProperty({ type: 'string', description: 'The name of the workshop' })
  name: string;
}

export class GetWorkshopsResponse {
  @Expose()
  @Type(() => WorkshopResponse)
  @ApiProperty({ isArray: true, type: WorkshopResponse })
  workshops: WorkshopResponse[];
}
