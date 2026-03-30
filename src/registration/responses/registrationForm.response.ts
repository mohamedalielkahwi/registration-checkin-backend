import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class WorkshopResponse {
  @Expose()
  @ApiProperty({ type: 'string', description: 'The ID of the workshop' })
  id: string;

  @Expose()
  @ApiProperty({ type: 'string', description: 'The name of the workshop' })
  name: string;
}

export class TeamResponse {
  @Expose()
  @ApiProperty({ type: 'string', description: 'The ID of the team' })
  id: string;
  @Expose()
  @ApiProperty({ type: 'string', description: 'The name of the team' })
  name: string;
}

export class FacResponse {
  @Expose()
  @ApiProperty({ type: 'string', description: 'The ID of the fac' })
  id: string;
  @Expose()
  @ApiProperty({ type: 'string', description: 'The name of the fac' })
  name: string;
}

export class RegistrationFormResponse {
  @Expose()
  @Type(() => WorkshopResponse)
  @ApiProperty({ isArray: true, type: WorkshopResponse })
  workshops: WorkshopResponse[];

  @Expose()
  @Type(() => TeamResponse)
  @ApiProperty({ type: TeamResponse, isArray: true })
  teams: TeamResponse[];

  @Expose()
  @ApiProperty({ type: FacResponse, isArray: true })
  facs: FacResponse[];

  @Expose()
  @ApiProperty({ type: 'string', description: 'The ID of the admin' })
  admins: { id: string; name: string }[];
}
