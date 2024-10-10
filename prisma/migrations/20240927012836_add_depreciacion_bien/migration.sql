-- AlterTable
ALTER TABLE "activo_unidades" ADD COLUMN     "fechaUltimaDepreciacion" TIMESTAMP(3),
ADD COLUMN     "vidaUtilCumplida" BOOLEAN NOT NULL DEFAULT false;
