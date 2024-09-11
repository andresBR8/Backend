/*
  Warnings:

  - You are about to drop the `Baja` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `asignacion_historial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mantenimientos` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `costoActual` to the `activo_unidades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estadoActual` to the `activo_unidades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estadoCondicion` to the `activo_unidades` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Baja" DROP CONSTRAINT "Baja_fkActivoUnidad_fkey";

-- DropForeignKey
ALTER TABLE "asignacion_historial" DROP CONSTRAINT "asignacion_historial_fkActivoUnidad_fkey";

-- DropForeignKey
ALTER TABLE "asignacion_historial" DROP CONSTRAINT "asignacion_historial_fkPersonal_fkey";

-- DropForeignKey
ALTER TABLE "asignacion_historial" DROP CONSTRAINT "asignacion_historial_fkUsuario_fkey";

-- DropForeignKey
ALTER TABLE "mantenimientos" DROP CONSTRAINT "mantenimientos_fkActivoUnidad_fkey";

-- AlterTable
ALTER TABLE "activo_unidades" ADD COLUMN     "costoActual" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "estadoActual" TEXT NOT NULL,
ADD COLUMN     "estadoCondicion" TEXT NOT NULL;

-- DropTable
DROP TABLE "Baja";

-- DropTable
DROP TABLE "asignacion_historial";

-- DropTable
DROP TABLE "mantenimientos";

-- CreateTable
CREATE TABLE "bajas" (
    "id" SERIAL NOT NULL,
    "fkActivoUnidad" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT NOT NULL,
    "estado" "BajaEstado" NOT NULL DEFAULT 'PENDIENTE',
    "creadoPor" TEXT NOT NULL,

    CONSTRAINT "bajas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_cambios" (
    "id" SERIAL NOT NULL,
    "fkActivoUnidad" INTEGER,
    "fkAsignacion" INTEGER,
    "fkReasignacion" INTEGER,
    "fkDepreciacion" INTEGER,
    "fechaCambio" TIMESTAMP(3) NOT NULL,
    "tipoCambio" TEXT NOT NULL,
    "detalle" TEXT NOT NULL,

    CONSTRAINT "historial_cambios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estado_activos" (
    "id" SERIAL NOT NULL,
    "fkActivoUnidad" INTEGER NOT NULL,
    "fechaCambio" TIMESTAMP(3) NOT NULL,
    "estadoAnterior" TEXT NOT NULL,
    "estadoNuevo" TEXT NOT NULL,
    "motivoCambio" TEXT,

    CONSTRAINT "estado_activos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bajas_fkActivoUnidad_idx" ON "bajas"("fkActivoUnidad");

-- CreateIndex
CREATE INDEX "historial_cambios_fkActivoUnidad_idx" ON "historial_cambios"("fkActivoUnidad");

-- CreateIndex
CREATE INDEX "historial_cambios_fkAsignacion_idx" ON "historial_cambios"("fkAsignacion");

-- CreateIndex
CREATE INDEX "historial_cambios_fkReasignacion_idx" ON "historial_cambios"("fkReasignacion");

-- CreateIndex
CREATE INDEX "historial_cambios_fkDepreciacion_idx" ON "historial_cambios"("fkDepreciacion");

-- CreateIndex
CREATE INDEX "estado_activos_fkActivoUnidad_idx" ON "estado_activos"("fkActivoUnidad");

-- CreateIndex
CREATE INDEX "activo_modelos_fkPartida_idx" ON "activo_modelos"("fkPartida");

-- CreateIndex
CREATE INDEX "activo_unidades_fkActivoModelo_idx" ON "activo_unidades"("fkActivoModelo");

-- CreateIndex
CREATE INDEX "activo_unidades_asignado_idx" ON "activo_unidades"("asignado");

-- CreateIndex
CREATE INDEX "asignacion_activo_unidades_fkAsignacion_idx" ON "asignacion_activo_unidades"("fkAsignacion");

-- CreateIndex
CREATE INDEX "asignacion_activo_unidades_fkActivoUnidad_idx" ON "asignacion_activo_unidades"("fkActivoUnidad");

-- CreateIndex
CREATE INDEX "asignaciones_fkUsuario_idx" ON "asignaciones"("fkUsuario");

-- CreateIndex
CREATE INDEX "asignaciones_fkPersonal_idx" ON "asignaciones"("fkPersonal");

-- CreateIndex
CREATE INDEX "depreciaciones_fkActivoUnidad_idx" ON "depreciaciones"("fkActivoUnidad");

-- CreateIndex
CREATE INDEX "personal_fkCargo_idx" ON "personal"("fkCargo");

-- CreateIndex
CREATE INDEX "personal_fkUnidad_idx" ON "personal"("fkUnidad");

-- CreateIndex
CREATE INDEX "reasignaciones_fkActivoUnidad_idx" ON "reasignaciones"("fkActivoUnidad");

-- CreateIndex
CREATE INDEX "reasignaciones_fkUsuarioAnterior_idx" ON "reasignaciones"("fkUsuarioAnterior");

-- CreateIndex
CREATE INDEX "reasignaciones_fkUsuarioNuevo_idx" ON "reasignaciones"("fkUsuarioNuevo");

-- CreateIndex
CREATE INDEX "reasignaciones_fkPersonalAnterior_idx" ON "reasignaciones"("fkPersonalAnterior");

-- CreateIndex
CREATE INDEX "reasignaciones_fkPersonalNuevo_idx" ON "reasignaciones"("fkPersonalNuevo");

-- AddForeignKey
ALTER TABLE "bajas" ADD CONSTRAINT "bajas_fkActivoUnidad_fkey" FOREIGN KEY ("fkActivoUnidad") REFERENCES "activo_unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_cambios" ADD CONSTRAINT "historial_cambios_fkActivoUnidad_fkey" FOREIGN KEY ("fkActivoUnidad") REFERENCES "activo_unidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_cambios" ADD CONSTRAINT "historial_cambios_fkAsignacion_fkey" FOREIGN KEY ("fkAsignacion") REFERENCES "asignaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_cambios" ADD CONSTRAINT "historial_cambios_fkReasignacion_fkey" FOREIGN KEY ("fkReasignacion") REFERENCES "reasignaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_cambios" ADD CONSTRAINT "historial_cambios_fkDepreciacion_fkey" FOREIGN KEY ("fkDepreciacion") REFERENCES "depreciaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estado_activos" ADD CONSTRAINT "estado_activos_fkActivoUnidad_fkey" FOREIGN KEY ("fkActivoUnidad") REFERENCES "activo_unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
