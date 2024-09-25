/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `personal` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `personal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "personal" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "personal_email_key" ON "personal"("email");
