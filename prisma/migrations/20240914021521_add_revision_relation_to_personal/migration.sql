-- CreateTable
CREATE TABLE "revisiones" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL,
    "general" BOOLEAN NOT NULL DEFAULT false,
    "fkPersonal" INTEGER,
    "observaciones" TEXT,
    "aprobado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "revisiones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "revisiones_fkPersonal_idx" ON "revisiones"("fkPersonal");

-- AddForeignKey
ALTER TABLE "revisiones" ADD CONSTRAINT "revisiones_fkPersonal_fkey" FOREIGN KEY ("fkPersonal") REFERENCES "personal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
