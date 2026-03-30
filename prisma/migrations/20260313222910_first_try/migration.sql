-- CreateEnum
CREATE TYPE "StudyLevel" AS ENUM ('FIRST', 'SECOND', 'THIRD');

-- CreateEnum
CREATE TYPE "Specialization" AS ENUM ('LICENSE', 'MASTER', 'DOCTORAT', 'ENGINEER', 'PREPARATORY', 'OTHER');

-- CreateTable
CREATE TABLE "Fac" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Fac_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "studyLevel" "StudyLevel",
    "specialization" "Specialization",
    "teamId" TEXT,
    "workshpOnly" BOOLEAN NOT NULL DEFAULT false,
    "ticketId" TEXT NOT NULL,
    "facId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "ticketNo" TEXT NOT NULL,
    "isCheckedIn" BOOLEAN NOT NULL DEFAULT false,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "hadMeal" BOOLEAN NOT NULL DEFAULT false,
    "hadLunch" BOOLEAN NOT NULL DEFAULT false,
    "workshopId" TEXT,
    "shortCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("ticketNo")
);

-- CreateTable
CREATE TABLE "WorkshopsByTicket" (
    "hasAttended" BOOLEAN NOT NULL DEFAULT false,
    "ticketId" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkshopsByTicket_pkey" PRIMARY KEY ("ticketId","workshopId")
);

-- CreateTable
CREATE TABLE "Workshop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workshop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fac_name_key" ON "Fac"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Attendee_email_key" ON "Attendee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Attendee_phone_key" ON "Attendee"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Attendee_ticketId_key" ON "Attendee"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_shortCode_key" ON "Ticket"("shortCode");

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("ticketNo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_facId_fkey" FOREIGN KEY ("facId") REFERENCES "Fac"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkshopsByTicket" ADD CONSTRAINT "WorkshopsByTicket_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("ticketNo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkshopsByTicket" ADD CONSTRAINT "WorkshopsByTicket_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
