/*
  Warnings:

  - Changed the type of `session` on the `Workshop` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Session" AS ENUM ('first', 'second');

-- AlterTable
ALTER TABLE "Workshop" DROP COLUMN "session",
ADD COLUMN     "session" "Session" NOT NULL;

-- DropEnum
DROP TYPE "session";
