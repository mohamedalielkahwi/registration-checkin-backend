import { ApiProperty } from '@nestjs/swagger';
import { GetRegistrationResponse } from './get-registration.response';

export class TeamName {
  @ApiProperty({ type: 'string', description: 'The ID of the Team' })
  id: string;

  @ApiProperty({ type: 'string', description: 'The name of the Team' })
  name: string;
}

export class Fac {
  @ApiProperty({ type: 'string', description: 'The ID of the Faculty' })
  id: string;

  @ApiProperty({ type: 'string', description: 'The name of the Faculty' })
  name: string;
}
export class WorkshopResponse {
  @ApiProperty({ type: 'string', description: 'The ID of the workshop' })
  id: string;

  @ApiProperty({ type: 'string', description: 'The name of the workshop' })
  name: string;
}

export class WorkshopByTicket {
  @ApiProperty({ type: 'boolean', description: 'The status of the workshop' })
  hasAttended: boolean;

  @ApiProperty({
    type: () => WorkshopResponse,
    description: 'The ID of the workshop',
  })
  workshop: WorkshopResponse;
}
export class TicketResponse {
  @ApiProperty({ type: 'string', description: 'The ID of the Ticket' })
  ticketNo: string;

  @ApiProperty({ type: 'boolean', description: 'The status of the Ticket' })
  done: boolean;
  @ApiProperty({
    type: 'boolean',
    description: 'The attendee had dinner or not',
  })
  hadMeal: boolean;
  @ApiProperty({
    type: () => [WorkshopByTicket],
    description: 'The workshop of the Ticket',
  })
  workshops: WorkshopByTicket[];
}

export class GetTeamResponse {
  @ApiProperty({ type: 'string', description: 'The ID of the Team' })
  id: string;
  @ApiProperty({ type: 'string', description: 'The name of the Team' })
  name: string;

  @ApiProperty({
    type: () => TicketResponse,
    description: 'The ticket ID of the Attendee',
  })
  @ApiProperty({
    type: () => [GetRegistrationResponse],
    description: 'The members of the team',
  })
  members: GetRegistrationResponse[];
}

export class GetRegistrationsResponse {
  @ApiProperty({ type: () => GetRegistrationResponse, isArray: true })
  data: GetRegistrationResponse[];

  @ApiProperty({
    type: 'integer',
    description: 'Total number of registrations',
  })
  totalItems: number;
}

export class GetTeamsResponse {
  @ApiProperty({ type: () => GetTeamResponse, isArray: true })
  data: GetTeamResponse[];

  @ApiProperty({
    type: 'integer',
    description: 'Total number of registrations',
  })
  totalItems: number;
}


