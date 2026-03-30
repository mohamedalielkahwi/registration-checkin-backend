import { ApiProperty } from '@nestjs/swagger';
import { Specialization, StudyLevel } from '@prisma/client';
import { Fac, TeamName, TicketResponse } from './get-registrations.response';

export class GetRegistrationResponse {
  @ApiProperty({ type: 'string', description: 'The ID of the Attendee' })
  id: string;
  @ApiProperty({ type: 'string', description: 'The name of the Attendee' })
  name: string;
  @ApiProperty({ type: 'string', description: 'The email of the Attendee' })
  email: string;
  @ApiProperty({
    type: 'string',
    description: 'The phone number of the Attendee',
  })
  phone: string;
  @ApiProperty({
    enum: StudyLevel,
    description: 'The study level of the Attendee',
  })
  studyLevel: StudyLevel;
  @ApiProperty({ type: () => Fac, description: 'The faculty of the Attendee' })
  fac: Fac;
  @ApiProperty({
    enum: Specialization,
    description: 'The specialization of the Attendee',
  })
  specialization: Specialization;
  @ApiProperty({
    type: () => TeamName,
    description: 'The team of the Attendee',
  })
  team: TeamName;
  @ApiProperty({
    type: () => TicketResponse,
    description: 'The ticket ID of the Attendee',
  })
  ticket: TicketResponse;
}
