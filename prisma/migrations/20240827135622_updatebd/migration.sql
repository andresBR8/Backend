-- AlterTable
ALTER TABLE "bajas" ADD COLUMN     "aprobadoPor" TEXT;

-- AlterTable
ALTER TABLE "depreciaciones" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "historial_cambios" ADD COLUMN     "fkEstadoActivo" INTEGER;

-- CreateIndex
CREATE INDEX "historial_cambios_fkEstadoActivo_idx" ON "historial_cambios"("fkEstadoActivo");

-- AddForeignKey
ALTER TABLE "historial_cambios" ADD CONSTRAINT "historial_cambios_fkEstadoActivo_fkey" FOREIGN KEY ("fkEstadoActivo") REFERENCES "estado_activos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
