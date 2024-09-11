/*
  Warnings:

  - Added the required column `avalAsignacion` to the `asignaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `avalReasignacion` to the `reasignaciones` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "asignaciones" ADD COLUMN     "avalAsignacion" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "historial_cambios" ADD COLUMN     "fkDevolucion" INTEGER;

-- AlterTable
ALTER TABLE "reasignaciones" ADD COLUMN     "avalReasignacion" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "devoluciones" (
    "id" SERIAL NOT NULL,
    "fkPersonal" INTEGER NOT NULL,
    "fkUsuario" TEXT NOT NULL,
    "fkActivoUnidad" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detalle" TEXT NOT NULL,
    "actaDevolucion" TEXT NOT NULL,

    CONSTRAINT "devoluciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "devoluciones_fkPersonal_idx" ON "devoluciones"("fkPersonal");

-- CreateIndex
CREATE INDEX "devoluciones_fkUsuario_idx" ON "devoluciones"("fkUsuario");

-- CreateIndex
CREATE INDEX "devoluciones_fkActivoUnidad_idx" ON "devoluciones"("fkActivoUnidad");

-- CreateIndex
CREATE INDEX "historial_cambios_fkDevolucion_idx" ON "historial_cambios"("fkDevolucion");

-- AddForeignKey
ALTER TABLE "historial_cambios" ADD CONSTRAINT "historial_cambios_fkDevolucion_fkey" FOREIGN KEY ("fkDevolucion") REFERENCES "devoluciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones" ADD CONSTRAINT "devoluciones_fkPersonal_fkey" FOREIGN KEY ("fkPersonal") REFERENCES "personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones" ADD CONSTRAINT "devoluciones_fkUsuario_fkey" FOREIGN KEY ("fkUsuario") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones" ADD CONSTRAINT "devoluciones_fkActivoUnidad_fkey" FOREIGN KEY ("fkActivoUnidad") REFERENCES "activo_unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
