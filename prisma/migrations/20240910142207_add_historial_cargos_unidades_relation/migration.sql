-- AlterTable
ALTER TABLE "activo_unidades" ADD COLUMN     "fkPersonalActual" INTEGER;

-- AlterTable
ALTER TABLE "personal" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "historial_cargo_unidad" (
    "id" SERIAL NOT NULL,
    "fkPersonal" INTEGER NOT NULL,
    "fkCargo" INTEGER NOT NULL,
    "fkUnidad" INTEGER NOT NULL,
    "fechaCambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_cargo_unidad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "historial_cargo_unidad_fkPersonal_idx" ON "historial_cargo_unidad"("fkPersonal");

-- CreateIndex
CREATE INDEX "historial_cargo_unidad_fkCargo_idx" ON "historial_cargo_unidad"("fkCargo");

-- CreateIndex
CREATE INDEX "historial_cargo_unidad_fkUnidad_idx" ON "historial_cargo_unidad"("fkUnidad");

-- AddForeignKey
ALTER TABLE "historial_cargo_unidad" ADD CONSTRAINT "historial_cargo_unidad_fkPersonal_fkey" FOREIGN KEY ("fkPersonal") REFERENCES "personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_cargo_unidad" ADD CONSTRAINT "historial_cargo_unidad_fkCargo_fkey" FOREIGN KEY ("fkCargo") REFERENCES "cargos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_cargo_unidad" ADD CONSTRAINT "historial_cargo_unidad_fkUnidad_fkey" FOREIGN KEY ("fkUnidad") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
