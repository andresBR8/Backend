/*
  Warnings:

  - Added the required column `metodo` to the `depreciaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodo` to the `depreciaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `depreciaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorNeto` to the `depreciaciones` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MetodoDepreciacion" AS ENUM ('LINEA_RECTA', 'SALDOS_DECRECIENTES');

-- AlterTable
ALTER TABLE "depreciaciones" ADD COLUMN     "causaEspecial" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "metodo" "MetodoDepreciacion" NOT NULL,
ADD COLUMN     "periodo" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "valorNeto" DOUBLE PRECISION NOT NULL;
