/*
  Warnings:

  - A unique constraint covering the columns `[fkRevision,fkPersonal]` on the table `revision_personal` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "revision_personal_fkRevision_fkPersonal_key" ON "revision_personal"("fkRevision", "fkPersonal");
