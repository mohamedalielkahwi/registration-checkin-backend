import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Specialization } from '@prisma/client';
import * as sharp from 'sharp';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as fs from 'node:fs';
import { PrismaService } from 'src/common/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { DinnerCheckin } from './dto/dinner-checkin.dto';
import {
  ShortCodeCheckinDto,
  GeneralCheckinDto,
} from './dto/general-checkin.dto';
import { GetRegistrationsDto } from './dto/get-registration.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { WorkshopCheckinDto } from './dto/WorkshopsCheckin.dto';
import { RegistrationFormResponse } from './responses/registrationForm.response';
import UpdateTeamDto from './dto/update-team.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { MarkPaid } from './dto/mark-paid.dto';
import { GetWorkshopsResponse } from './responses/get-workshops.response';
@Injectable()
export class RegistrationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailerService: MailerService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async markTicketAsPaid(markPaid: MarkPaid) {
    const { email, adminId } = markPaid;
    const attendee = await this.prismaService.attendee.findFirst({
      where: { email: email.toLowerCase() },
      select: {
        name: true,
        email: true,
        ticket: {
          select: {
            ticketNo: true,
            isPaid: true,
            shortCode: true,
          },
        },
      },
    });

    if (!attendee?.ticket) {
      throw new NotFoundException(`Ticket not found for email ${email}`);
    }

    if (attendee.ticket.isPaid) {
      throw new BadRequestException('Ticket already paid');
    }
    const updatedTicket = await this.prismaService.ticket.update({
      where: { ticketNo: attendee.ticket.ticketNo },
      data: { isPaid: !attendee.ticket.isPaid ,adminId},
    });
    await this.sendPaymentConfirmationEmail(
      attendee.email,
      attendee.name,
      attendee.ticket.shortCode,
    );
    await this.refreshCache();

    return updatedTicket;
  }

  async confirmLunch(dinnerCheckin: DinnerCheckin) {
    const { ticketNo } = dinnerCheckin;
    console.log(dinnerCheckin);
    const ticket = await this.prismaService.ticket.findFirst({
      where: {
        ticketNo,
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const updatedTicket = await this.prismaService.ticket.update({
      where: {
        ticketNo,
      },
      data: {
        hadLunch: !ticket.hadLunch,
      },
    });
    await this.refreshCache();

    return updatedTicket;
  }
  async confirmDinner(dinnerCheckin: DinnerCheckin) {
    const { ticketNo } = dinnerCheckin;
    console.log(dinnerCheckin);
    const ticket = await this.prismaService.ticket.findFirst({
      where: {
        ticketNo,
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const updatedTicket = await this.prismaService.ticket.update({
      where: {
        ticketNo,
      },
      data: {
        hadMeal: !ticket.hadMeal,
      },
    });
    await this.refreshCache();

    return updatedTicket;
  }

  async confirmWorkshopCheckin(workshopCheckinDto: WorkshopCheckinDto) {
    const { ticketNo, workshopId } = workshopCheckinDto;
    const workshop = await this.prismaService.workshopsByTicket.findUnique({
      where: {
        ticketId_workshopId: {
          ticketId: ticketNo,
          workshopId,
        },
      },
    });

    if (!workshop) throw new BadRequestException('Workshop not found');

    const updatedWorkshop = await this.prismaService.workshopsByTicket.update({
      where: {
        ticketId_workshopId: {
          ticketId: ticketNo,
          workshopId,
        },
      },
      data: {
        hasAttended: !workshop.hasAttended,
      },
    });

    await this.refreshCache();

    return updatedWorkshop;
  }
  async confirmGeneralCheckin(generalCheckinDto: GeneralCheckinDto) {
    const { ticketNo } = generalCheckinDto;
    try {
      const ticket = await this.prismaService.ticket.findFirst({
        where: {
          ticketNo,
        },
      });
      if (!ticket) throw new BadRequestException('Ticket not found');

      const updatedTicket = await this.prismaService.ticket.update({
        where: {
          ticketNo,
          // done: false, // Ensure ticket is not already marked as done
        },
        data: {
          isCheckedIn: !ticket.isCheckedIn,
        },
      });
      await this.refreshCache();

      return updatedTicket;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        // Handle the case where the ticket is already confirmed
        throw new ConflictException('Ticket has already been confirmed !');
      } else {
        // Handle other errors
        throw error;
      }
    }
  }

  async shortCodeCheckin(shortCodeCheckinDto: ShortCodeCheckinDto) {
    const { shortCode } = shortCodeCheckinDto;
    try {
      const ticket = await this.prismaService.ticket.findFirst({
        where: {
          shortCode,
        },
        select: {
          ticketNo: true,
          isCheckedIn: true,
          attendee: {
            select: {
              name: true,
            },
          },
        },
      });

      console.log('the ticket must be here!', ticket);
      if (!ticket) throw new BadRequestException('Ticket not found');

      await this.prismaService.ticket.update({
        where: {
          ticketNo: ticket.ticketNo,
          // done: false, // Ensure ticket is not already marked as done
        },
        data: {
          isCheckedIn: !ticket.isCheckedIn,
        },
      });
      await this.refreshCache();

      return ticket;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        // Handle the case where the ticket is already confirmed
        throw new ConflictException('Ticket has already been confirmed !');
      } else {
        // Handle other errors
        throw error;
      }
    }
  }

  async verifyTicketCode(ticketNo: string) {
    try {
      return await this.prismaService.ticket.findFirstOrThrow({
        where: {
          ticketNo,
        },
        select: {
          ticketNo: true,
          isCheckedIn: true,
          hadLunch: true,
          hadMeal: true,
          attendee: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              specialization: true,
              studyLevel: true,
              facId: true,
              team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          workshops: {
            select: {
              hasAttended: true,
              workshop: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw new Error('Invalid Ticket code');
    }
  }

  async overlayToTicket() {
    const ticketImage = fs.readFileSync('public/ticket.png');
    const image = sharp(ticketImage);
    const overlay = await image.png().toBuffer();
    return `data:image/png;base64,${overlay.toString('base64')}`;
  }
  async registerAttendee(createRegistrationDto: CreateRegistrationDto) {
    //save data
    const { code } = await this.CreateRegistration(createRegistrationDto);
    const { email, name, isPaid } = createRegistrationDto;
    // const fullTicket = await this.overlayToTicket();
    //send email
    if (isPaid) {
      await this.sendPaymentConfirmationEmail(email, name, code);
    } else {
      await this.sendEmail(email, name);
    }
    await this.refreshCache();
    return { message: 'Registration successful' };
  }

  async getWorkshops(): Promise<GetWorkshopsResponse> {
    const workshops = await this.prismaService.workshop.findMany({
      select: {
        id: true,
        name: true,
        session: true,
      },
    });
    return { workshops };
  }

  async getRegistrationForm(): Promise<RegistrationFormResponse> {
    const workshops = await this.prismaService.workshop.findMany({
      select: {
        id: true,
        name: true,
        session: true,
      },
    });
    const teams = await this.prismaService.team.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const facs = await this.prismaService.fac.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    
    const admins = await this.prismaService.admins.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return { workshops, teams, facs, admins };
  }

  async findAll(getRegistrationsDto: GetRegistrationsDto) {
    const { currentPage = 0, sizePerPage = 200, search } = getRegistrationsDto;

    const isPagination = currentPage !== undefined && sizePerPage !== undefined;
    const take = isPagination ? sizePerPage : undefined;
    const skip = isPagination ? (currentPage || 0) * sizePerPage : undefined;

    const where: Prisma.AttendeeWhereInput = search
      ? {
          OR: [
            {
              name: {
                contains: search,
              },
            },
            {
              email: {
                contains: search,
              },
            },
          ],
        }
      : {};

    const [registrations, totalItems] = await this.prismaService.$transaction(
      async (tx) => {
        const registrations = await tx.attendee.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            studyLevel: true,
            specialization: true,
            workshpOnly: true,
            fac: {
              select: {
                id: true,
                name: true,
              },
            },
            team: {
              select: {
                id: true,
                name: true,
              },
            },
            ticket: {
              select: {
                isPaid: true,
                ticketNo: true,
                isCheckedIn: true,
                hadMeal: true,
                shortCode: true,
                admin:{
                  select:{
                    id:true,
                    name:true,
                  }
                },
                workshops: {
                  select: {
                    hasAttended: true,
                    workshop: {
                      select: {
                        id: true,
                        name: true,
                        session: true,
                      },
                    },
                  },
                },
              },
            },
          },
          where,
          take,
          skip,
        });
        let count;
        if (isPagination)
          count = await tx.attendee.aggregate({
            _count: {
              _all: true,
            },
            where,
          });
        return [registrations, count];
      },
    );

    return { data: registrations, totalItems: totalItems?._count?._all };
  }

  async CreateRegistration(createRegistrationDto: CreateRegistrationDto) {
    const {
      teamId,
      teamName,
      workshpOnly,
      workshopIds,
      name,
      email,
      phone,
      studyLevel,
      facName,
      specialization,
      facId,
      isPaid,
      paidToId
    } = createRegistrationDto;

    const isEmailUsed = await this.prismaService.attendee.findFirst({
      where: {
        email : email.toLowerCase(),
      },
    });
    if (isEmailUsed) throw new ConflictException('email already used');

    const isPhoneUsed = await this.prismaService.attendee.findFirst({
      where: {
        phone,
      },
    });
    if (isPhoneUsed) throw new ConflictException('phone number already used');

    if (!teamId && teamName) {
      const existingTeam = await this.prismaService.team.findFirst({
        where: {
          name: { equals: teamName, mode: 'insensitive' },
        },
      });

      if (existingTeam) {
        throw new ConflictException('team already exists');
      }
    }

    // Check team size constraint if joining existing team
    if (teamId) {
      const teamMembersCount = await this.prismaService.attendee.count({
        where: {
          teamId,
        },
      });

      if (teamMembersCount >= 4) {
        throw new ConflictException(
          'Team is full. Maximum 4 members per team.',
        );
      }
    }

    const isStudent = specialization !== Specialization.OTHER;
    let isUnique = false;
    let code: string;

    while (!isUnique) {
      code = Math.floor(100000 + Math.random() * 900000).toString();

      const existingEntry = await this.prismaService.ticket.findUnique({
        where: {
          shortCode: code,
        },
      });

      if (!existingEntry) {
        isUnique = true;
      }
    }

    return await this.prismaService.$transaction(async (tx) => {
      const { ticketNo: ticketId } = await tx.ticket.create({
        data: {
          isPaid,
          shortCode: code,
          admin:{
            connect: paidToId ? { id: paidToId } : undefined,
          },
          workshops: {
            create: [
              ...(workshopIds ?? []).map((id) => ({
                workshop: {
                  connect: {
                    id,
                  },
                },
              })),
            ],
          },
        },
        select: {
          ticketNo: true,
        },
      });

      let team;
      if (!teamId && !workshpOnly)
        team = await tx.team.create({
          data: {
            name: teamName,
          },
        });

      let fac;
      if (isStudent && !facId)
        fac = await tx.fac.create({
          data: {
            name: facName,
          },
          select: {
            id: true,
          },
        });

      // Extract team connection logic to a variable
      let teamConnect;
      if (workshpOnly) {
        teamConnect = undefined;
      } else if (teamId) {
        teamConnect = { connect: { id: teamId } };
      } else {
        teamConnect = { connect: { id: team.id } };
      }

      await tx.attendee.create({
        data: {
          name,
          email:email.toLowerCase(),
          phone,
          studyLevel,
          workshpOnly: workshpOnly,
          ticket: {
            connect: {
              ticketNo: ticketId,
            },
          },
          team: teamConnect,
          fac: isStudent ? { connect: { id: facId || fac?.id } } : undefined,
          specialization,
        },
      });

      return { ticketId, code };
    });
  }

  async sendPaymentConfirmationEmail(
    to: string,
    name: string,
    shortcode: string,
  ) {
    const template = fs.readFileSync('public/payment_template.html', 'utf8');
    let content = template.replace('{{NAME}}', name);
    try {
      await this.mailerService.sendMail({
        to,
        from: 'cybersummit@outlook.com',
        subject: 'Cyber Summit V4 – Registration Received 🚀',
        attachDataUrls: true,
        html: content,
      });
    } catch (error) {
      console.log({ error });
    }
  }

  async sendWorkshopReminderEmail() {
    const attendee = await this.prismaService.attendee.findMany({
      where: {
        ticket: {
          isPaid: { equals: true },
          workshops: {
            none: {},
          },
        },
      },
    });
    if (!attendee)
      throw new NotFoundException(
        'No attendees found for workshop reminder email',
      );
    for (const a of attendee) {
      const template = fs.readFileSync(
        'public/workshop_reminder_template.html',
        'utf8',
      );
      let content = template.replace('{{NAME}}', a.name);
      try {
        await this.mailerService.sendMail({
          to: a.email,
          from: 'cybersummit@outlook.com',
          subject: 'Cyber Summit V4 Workshop Reminder 🚀',
          html: content,
        });
      } catch (error) {
        console.log({ error });
      }
    }
  }
  async sendPaymentReminderEmail() {
    const attendees = await this.prismaService.attendee.findMany({
      where: {
        ticket: {
          isPaid: { equals: false },
        },
      },
    });
    if (!attendees)
      throw new NotFoundException(
        'No attendees found for payment reminder email',
      );
    for (const a of attendees) {
      const template = fs.readFileSync(
        'public/payment_reminder_template.html',
        'utf8',
      );
      let content = template.replace('{{NAME}}', a.name);
      try {
        await this.mailerService.sendMail({
          to: a.email,
          from: 'cybersummit@outlook.com',
          subject: 'Cyber Summit V4 Payment Reminder 🚀',
          html: content,
        });
      } catch (error) {
        console.log({ error });
      }
    }
  }
  async sendEmail(to: string, name: string) {
    const template = fs.readFileSync('public/template.html', 'utf8');

    let content = template.replace('{{NAME}}', name);

    try {
      await this.mailerService.sendMail({
        to: to,
        from: 'cybersummit@outlook.com',
        subject: 'Payment Information – Cyber Summit 💳',
        text: 'welcome participant',
        attachDataUrls: true, //to accept base64 content in messsage
        html: content,
      });
    } catch (error) {
      console.log({ error });
    }
  }

  async findOneById(id: string) {
    console.log('getting attendee', id);
    return await this.prismaService.attendee.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        studyLevel: true,
        specialization: true,
        fac: {
          select: {
            id: true,
            name: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        ticket: {
          select: {
            ticketNo: true,
            isCheckedIn: true,
            hadMeal: true,
            shortCode: true,
            workshops: {
              select: {
                hasAttended: true,
                workshop: {
                  select: {
                    id: true,
                    name: true,
                    session: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findAllTeams(search?: string) {
    const where: Prisma.TeamWhereInput = search
      ? {
          name: {
            contains: search,
          },
        }
      : {};

    return await this.prismaService.team.findMany({
      where,
      select: {
        id: true,
        name: true,
        members: {
          select: {
            id: true,
            name: true,
            ticket: {
              select: {
                ticketNo: true,
                isCheckedIn: true,
                workshops: {
                  select: {
                    hasAttended: true,
                    workshop: {
                      select: {
                        id: true,
                        name: true,
                        session: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }
  async refreshCache() {
    await this.cacheManager.reset();
  }

  async updateTeam(updateTeamDto: UpdateTeamDto) {
    const { id, name } = updateTeamDto;

    const team = await this.prismaService.team.findUnique({
      where: {
        id,
      },
    });

    if (!team) throw new NotFoundException('Team not found');

    await this.prismaService.team.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });
    this.refreshCache();
  }

  async deleteTeam(id: string) {
    // checking if the team has members
    const team = await this.prismaService.team.findUnique({
      where: {
        id,
      },
      include: {
        members: true,
      },
    });
    if (!team) throw new NotFoundException('Team not found');
    if (team.members.length > 0) {
      throw new BadRequestException('This Team Has Memebers');
    }

    await this.prismaService.team.delete({
      where: {
        id,
      },
    });

    this.refreshCache();
    return { message: 'Team deleted successfully' };
  }

  async updateRegistration(updateRegistrationDto: UpdateRegistrationDto) {
    // checking attendee registration
    const attendee = await this.prismaService.attendee.findUnique({
      where: {
        id: updateRegistrationDto.id,
      },
      include: {
        ticket: true,
      },
    });

    if (!attendee) throw new NotFoundException('Attendee not found');

    // updating attendee registration
    const teamId = updateRegistrationDto.teamId
      ? updateRegistrationDto.teamId
      : (
          await this.prismaService.team.create({
            data: {
              name: updateRegistrationDto.teamName,
            },
          })
        ).id;

    await this.prismaService.attendee.update({
      where: {
        id: updateRegistrationDto.id,
      },
      data: {
        name: updateRegistrationDto.name,
        email: updateRegistrationDto.email,
        phone: updateRegistrationDto.phone,
        teamId: teamId,
      },
    });

    // updating workshops
    await this.prismaService.$transaction(async (tx) => {
      await tx.workshopsByTicket.deleteMany({
        where: {
          ticketId: attendee.ticketId,
        },
      });

      await tx.workshopsByTicket.createMany({
        data: updateRegistrationDto.workshopIds.map((workshopId) => ({
          ticketId: attendee.ticketId,
          workshopId,
        })),
      });
    });

    if (attendee.email !== updateRegistrationDto.email) {
      this.sendEmail(attendee.email, attendee.name);
    }

    this.refreshCache();
  }
  async updateworkshop(updateWorkshopDto: UpdateWorkshopDto) {
    const { email, workshopIds } = updateWorkshopDto;

    const attendee = await this.prismaService.attendee.findFirst({
      where: {
        email: email.toLowerCase(),
        ticket: {
          isPaid: true,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        studyLevel: true,
        specialization: true,
        fac: {
          select: {
            id: true,
            name: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        ticket: {
          select: {
            ticketNo: true,
            isCheckedIn: true,
            hadMeal: true,
            shortCode: true,
            workshops: {
              select: {
                hasAttended: true,
                workshop: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!attendee)
      throw new NotFoundException('Attendee not found or not paid');

    if (attendee.ticket.workshops.length != 0)
      throw new BadRequestException('Attendee already has workshop');
    for (let i = 0; i < workshopIds.length; i++) {
      const workshop = await this.prismaService.workshop.findUnique({
        where: {
          id: workshopIds[i],
        },
      });
      if (!workshop)
        throw new NotFoundException('Workshop ' + (i + 1) + ' not found');
    }

    for (const element of workshopIds) {
      await this.prismaService.workshopsByTicket.create({
        data: {
          ticketId: attendee.ticket.ticketNo,
          workshopId: element,
        },
      });
    }
    this.refreshCache();
    return { message: 'Workshop added successfully' };
  }
}
