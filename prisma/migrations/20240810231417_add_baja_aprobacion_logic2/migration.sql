/*
  Warnings:

  - You are about to drop the `bajas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bajas" DROP CONSTRAINT "bajas_fkActivoUnidad_fkey";

-- DropTable
DROP TABLE "bajas";

-- CreateTable
CREATE TABLE "Baja" (
    "id" SERIAL NOT NULL,
    "fkActivoUnidad" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT NOT NULL,
    "estado" "BajaEstado" NOT NULL DEFAULT 'PENDIENTE',
    "creadoPor" TEXT NOT NULL,

    CONSTRAINT "Baja_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Baja" ADD CONSTRAINT "Baja_fkActivoUnidad_fkey" FOREIGN KEY ("fkActivoUnidad") REFERENCES "activo_unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
