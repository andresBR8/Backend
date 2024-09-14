-- CreateTable
CREATE TABLE "revision_personal" (
    "id" SERIAL NOT NULL,
    "fkRevision" INTEGER NOT NULL,
    "fkPersonal" INTEGER NOT NULL,
    "aprobado" BOOLEAN NOT NULL,
    "observaciones" TEXT,

    CONSTRAINT "revision_personal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "revision_personal_fkRevision_idx" ON "revision_personal"("fkRevision");

-- CreateIndex
CREATE INDEX "revision_personal_fkPersonal_idx" ON "revision_personal"("fkPersonal");

-- AddForeignKey
ALTER TABLE "revision_personal" ADD CONSTRAINT "revision_personal_fkPersonal_fkey" FOREIGN KEY ("fkPersonal") REFERENCES "personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision_personal" ADD CONSTRAINT "revision_personal_fkRevision_fkey" FOREIGN KEY ("fkRevision") REFERENCES "revisiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
