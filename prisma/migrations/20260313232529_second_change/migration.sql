/*
  Warnings:

  - Added the required column `session` to the `Workshop` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "session" AS ENUM ('first', 'second');

-- AlterTable
ALTER TABLE "Workshop" ADD COLUMN     "session" "session" NOT NULL;
