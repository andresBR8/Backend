-- AlterTable
ALTER TABLE "activo_modelos" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "reasignaciones" (
    "id" SERIAL NOT NULL,
    "fkActivoUnidad" INTEGER NOT NULL,
    "fkUsuarioAnterior" TEXT NOT NULL,
    "fkUsuarioNuevo" TEXT NOT NULL,
    "fkPersonalAnterior" INTEGER NOT NULL,
    "fkPersonalNuevo" INTEGER NOT NULL,
    "fechaReasignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detalle" TEXT NOT NULL,

    CONSTRAINT "reasignaciones_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reasignaciones" ADD CONSTRAINT "reasignaciones_fkActivoUnidad_fkey" FOREIGN KEY ("fkActivoUnidad") REFERENCES "activo_unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reasignaciones" ADD CONSTRAINT "reasignaciones_fkUsuarioAnterior_fkey" FOREIGN KEY ("fkUsuarioAnterior") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reasignaciones" ADD CONSTRAINT "reasignaciones_fkUsuarioNuevo_fkey" FOREIGN KEY ("fkUsuarioNuevo") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reasignaciones" ADD CONSTRAINT "reasignaciones_fkPersonalAnterior_fkey" FOREIGN KEY ("fkPersonalAnterior") REFERENCES "personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reasignaciones" ADD CONSTRAINT "reasignaciones_fkPersonalNuevo_fkey" FOREIGN KEY ("fkPersonalNuevo") REFERENCES "personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
