/*
  Warnings:

  - Added the required column `updatedAt` to the `bajas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `bajas` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BajaEstado" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- AlterTable
ALTER TABLE "bajas" ADD COLUMN     "administradorId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "estado" "BajaEstado" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "usuarioId" TEXT NOT NULL;
