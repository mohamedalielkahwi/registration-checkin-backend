import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import {
  TicketNoValidationPipe,
} from 'src/common/custom-validation';
import { WorkshopCheckinDto } from './dto/WorkshopsCheckin.dto';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { DinnerCheckin } from './dto/dinner-checkin.dto';
import { GeneralCheckinDto, ShortCodeCheckinDto } from './dto/general-checkin.dto';
import { GetRegistrationsDto } from './dto/get-registration.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import UpdateTeamDto from './dto/update-team.dto';
import { RegistrationService } from './registration.service';
import { GetRegistrationResponse } from './responses/get-registration.response';
import {
  GetRegistrationsResponse,
  GetTeamsResponse,
} from './responses/get-registrations.response';
import { RegistrationFormResponse } from './responses/registrationForm.response';
import { MarkPaid } from './dto/mark-paid.dto';
import { Public } from '../decorators/public.decorator'; // Import the decorator
import { GetWorkshopsResponse } from './responses/get-workshops.response';

@UseGuards(JwtAuthGuard)
@ApiTags('Registration')
@UseInterceptors(CacheInterceptor)
@Controller('registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Get('/get-form')
  @ApiOkResponse({
    description: 'Get registration form',
    type: RegistrationFormResponse,
  })
  getRegistrationForm() {
    return this.registrationService.getRegistrationForm();
  }

  @Public()
  @Get('/public/get-form')
  @ApiOkResponse({
    description: 'Get registration form (public)',
    type: RegistrationFormResponse,
  })
  getPublicRegistrationForm() {
    return this.registrationService.getRegistrationForm();
  }

  @Get('/')
  @ApiOkResponse({
    description: 'Get all registrations',
    type: GetRegistrationsResponse,
  })
  getRegistrations(@Query() getRegistrationsDto: GetRegistrationsDto) {
    return this.registrationService.findAll(getRegistrationsDto);
  }

  @Get('/teams')
  @ApiOkResponse({
    description: 'Get all teams with their members',
    type: GetTeamsResponse,
  })
  getTeams(@Query('search') search: string) {
    return this.registrationService.findAllTeams(search);
  }

  @Get('/workshops')
  @ApiOkResponse({
    description: 'Get all workshops',
    type: GetWorkshopsResponse,
  })
  getWorkshops() {
    return this.registrationService.getWorkshops();
  }
  @Get('/public/workshops')
  @Public()
  @ApiOkResponse({
    description: 'Get all workshops',
    type: GetWorkshopsResponse,
  })
  getWorkshopsPublic() {
    return this.registrationService.getWorkshops();
  }

  @Get('/:id')
  @ApiOkResponse({
    description: 'Get a single registration',
    type: GetRegistrationResponse,
  })
  getSingleRegistration(@Param('id') id: string) {
    return this.registrationService.findOneById(id);
  }


  @Get('/verify-ticketId/:ticketId')
  verifyCode(
    @Param('ticketId', new TicketNoValidationPipe()) ticketId: string,
  ) {
    return this.registrationService.verifyTicketCode(ticketId);
  }

  @Patch('/confirm-general-checkin')
  confirmGeneralCheckin(@Body() generalCheckinDto: GeneralCheckinDto) {
    return this.registrationService.confirmGeneralCheckin(generalCheckinDto);
  }

  @Patch('/confirm-checkin-shortcode')
  @UseGuards(JwtAuthGuard)
  confirmCheckinShortcode(@Body() shortCodeCheckinDto: ShortCodeCheckinDto) {
    return this.registrationService.shortCodeCheckin(shortCodeCheckinDto);
  }

  @Patch('/confirm-workshop-checkin')
  confirmWorkshopCheckin(@Body() workshopCheckinDto: WorkshopCheckinDto) {
    return this.registrationService.confirmWorkshopCheckin(workshopCheckinDto);
  }
  @Patch('/confirm-dinner')
  confirmDinner(@Body() dinnerCheckin: DinnerCheckin) {
    return this.registrationService.confirmDinner(dinnerCheckin);
  }

  @Post('send-confirmation-workshop-email')
  sendConfirmationWorkshopEmail() {
    return this.registrationService.sendWorkshopReminderEmail();
  }

  @Post('send-payment-reminder-email')
  sendPaymentReminderEmail() {
    return this.registrationService.sendPaymentReminderEmail();
  }

  @Patch('/confirm-lunch')
  confirmLunch(@Body() dinnerCheckin: DinnerCheckin) {
    return this.registrationService.confirmLunch(dinnerCheckin);
  }

  @Patch('/confirm-paid')
  confirmPaid(@Body() markPaid: MarkPaid) {
    console.log('Received markPaid:', markPaid);
    return this.registrationService.markTicketAsPaid(markPaid);
  }

  @Post()
  registerAttendee(@Body() createRegistrationDto: CreateRegistrationDto) {
    return this.registrationService.registerAttendee(createRegistrationDto);
  }

  @Public()
  @Post('/public')
  registerPublicAttendee(@Body() createRegistrationDto: CreateRegistrationDto) {
    return this.registrationService.registerAttendee(createRegistrationDto);
  }

  @Patch('teams')
  updateTeam(@Body() updateTeamDto: UpdateTeamDto) {
    return this.registrationService.updateTeam(updateTeamDto);
  }

  @Delete('teams/:id')
  deleteTeam(@Param('id') id: string) {
    return this.registrationService.deleteTeam(id);
  }

  @Patch()
  updateRegistration(@Body() updateRegistration: UpdateRegistrationDto) {
    return this.registrationService.updateRegistration(updateRegistration);
  }

  @Patch('workshop')
  updateWorkshop(@Body() updateworkshop: UpdateWorkshopDto) {
    return this.registrationService.updateworkshop(updateworkshop);
  }
  @Public()
  @Patch('public/workshop')
  updateWorkshopPublic(@Body() updateworkshop: UpdateWorkshopDto) {
    return this.registrationService.updateworkshop(updateworkshop);
  }
}
