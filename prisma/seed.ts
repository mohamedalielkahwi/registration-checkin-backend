import {
  PrismaClient,
  Session,
  StudyLevel,
  Specialization,
} from '@prisma/client';

const prisma = new PrismaClient();

async function seedWorkshops() {
  const workshopsData = [
    { name: 'N8N: Workflow Automation in Action', session: Session.first },
    {
      name: 'Backend: Clean architecture & best Practices',
      session: Session.first,
    },
    {
      name: 'Design Patterns: Writing Scalable & Maintainable Code',
      session: Session.second,
    },
    {
      name: 'Generative AI: Creating generative models from scratch',
      session: Session.second,
    },
    {
      name: 'How to win a Hackathon: Keys to Hackathon Success',
      session: Session.second,
    },
  ];

  return prisma.workshop.createMany({ data: workshopsData });
}

async function seedFacs() {
  const facsData = [
    { name: 'ISSAT sousse' },
    { name: 'Pristini' },
    { name: 'ENISO' },
    { name: 'EPI' },
    { name: 'ISET SOUSSE' },
    { name: 'ISITCOM' },
    { name: 'ISG SOUSSE' },
  ];

  return prisma.fac.createMany({ data: facsData });
}

async function seedTeams() {
  const teams = [
    { name: 'Code Titans' },
    { name: 'Bug Hunters' },
    { name: 'Hack Masters' },
    { name: 'AI Ninjas' },
  ];

  return prisma.team.createMany({ data: teams });
}

function randomBool() {
  return Math.random() > 0.5;
}

function randomItem(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedAdmins() {
  const adminsData = [
    { name: 'Mohamed Ali Elkahwi' },
    { name: 'Douaa Assila' },
    { name: 'Fakher Ben Neila' },
    { name: 'Mohammed Amine Naimi' },
    { name: 'Mohamed Amine slama' },
    { name: 'Chayma Chebbi' },
    { name: 'Hakim Zakhama' },
    { name: 'Mohamed Aziz Zbiba' },
    { name: 'Chayma Mefteh' },
    { name: 'Oumayma Younes' },
    { name: 'Mohamed Amine Bouachour' },
    { name: 'Rayen Sghair' },
    { name: 'Takwa Nebli' },
    { name: 'Amine Jendli' },
    { name: 'Zeyneb Houidi' },
    { name: 'Zeyneb Kouki' },
    { name: 'Ayoub Lourimi' },
    { name: 'Youssed Hamouda' },
    { name: 'Takwa Gribej' },
    { name: 'Tasnim Guesmi' },
    { name: 'Ons Mathlouthi' },
    { name: 'Amal Fekih' },
    { name: 'Senda Ajmi' },
    { name: 'Fatma mbarek' },
    { name: 'Mazen Elheni' },
    { name: 'Zeneb rdifi' },
    { name: 'Haroun Omri' },
    { name: 'Mohammed Ali boukadida' },
    { name: 'Mariem Jellibi' },
    { name: 'Malek zaag' },
    { name: 'Wissem Farah' },
    { name: 'Ibrahim Irqui' },
    { name: 'Sarra Gharbi' },
    { name: 'Abroug Israa' },
    { name: 'Ahlem Benrabaa' },
    { name: 'Ali Khazri' },
    { name: 'Amal Chebbi' },
    { name: 'Aziz Abeda' },
    { name: 'Ahlem Smii' },
    { name: 'Bayrem Arous' },
    { name: 'Takwa Ben Hamouda' },
    { name: 'Yassmine Bouslimi' },
    { name: 'Eya Balloum' },
    { name: 'Fakhri chihi' },
    { name: 'Haythem Gaaloul' },
    { name: 'Ines Mansouri' },
    { name: 'Mariem Romdhane' },
    { name: 'nouha mili' },
    { name: 'Ouday Bouaziz' },
    { name: 'Raouia Rahmani' },
    { name: 'Rayen Chaouech' },
    { name: 'Samend Ben Jezia' },
    { name: 'Salem Ben Mansour' },
    { name: 'Shayma massoudi' },
    { name: 'Takwa mokni' },
    { name: 'Tasnim Hadded' },
    { name: 'Shayma massoudi' },
  ];

  return prisma.admins.createMany({ data: adminsData });
}

async function seedAttendees() {
  const facs = await prisma.fac.findMany();
  const teams = await prisma.team.findMany();
  const workshops = await prisma.workshop.findMany();

  for (let i = 1; i <= 40; i++) {
    const ticket = await prisma.ticket.create({
      data: {
        shortCode: `TICKET-${i}`,
        isCheckedIn: randomBool(),
        isPaid: randomBool(),
        hadMeal: randomBool(),
        hadLunch: randomBool(),
      },
    });

    const attendee = await prisma.attendee.create({
      data: {
        name: `Attendee ${i}`,
        email: `attendee${i}@test.com`,
        phone: `900000${i.toString().padStart(2, '0')}`,
        studyLevel: randomItem([
          StudyLevel.FIRST,
          StudyLevel.SECOND,
          StudyLevel.THIRD,
        ]),
        specialization: randomItem([
          Specialization.LICENSE,
          Specialization.MASTER,
          Specialization.ENGINEER,
          Specialization.PREPARATORY,
        ]),
        teamId: randomBool() ? randomItem(teams).id : null,
        facId: randomItem(facs).id,
        workshpOnly: randomBool(),
        ticketId: ticket.ticketNo,
      },
    });

    // assign workshops
    const shuffled = workshops.sort(() => 0.5 - Math.random()).slice(0, 2);

    for (const w of shuffled) {
      await prisma.workshopsByTicket.create({
        data: {
          ticketId: ticket.ticketNo,
          workshopId: w.id,
          hasAttended: randomBool(),
        },
      });
    }
  }
}

async function main() {
  // await seedWorkshops();
  await seedFacs();
  // await seedTeams();
  // await seedAttendees();
  await seedAdmins();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
