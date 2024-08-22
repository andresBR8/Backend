-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL,
    "resetToken" TEXT,
    "resetTokenExpiration" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ci" TEXT NOT NULL,
    "fkCargo" INTEGER NOT NULL,
    "fkUnidad" INTEGER NOT NULL,

    CONSTRAINT "personal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "cargos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "unidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partidas" (
    "id" SERIAL NOT NULL,
    "codigoPartida" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "vidaUtil" INTEGER NOT NULL,
    "porcentajeDepreciacion" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "partidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activo_modelos" (
    "id" SERIAL NOT NULL,
    "fkPartida" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "costo" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL,
    "codigoAnterior" TEXT,
    "codigoNuevo" TEXT NOT NULL,
    "ordenCompra" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "activo_modelos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activo_unidades" (
    "id" SERIAL NOT NULL,
    "fkActivoModelo" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "asignado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "activo_unidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones" (
    "id" SERIAL NOT NULL,
    "fkUsuario" TEXT NOT NULL,
    "fkPersonal" INTEGER NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL,
    "detalle" TEXT NOT NULL,

    CONSTRAINT "asignaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignacion_historial" (
    "id" SERIAL NOT NULL,
    "fkActivoUnidad" INTEGER NOT NULL,
    "fkUsuario" TEXT NOT NULL,
    "fkPersonal" INTEGER NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL,
    "detalle" TEXT NOT NULL,

    CONSTRAINT "asignacion_historial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignacion_activo_unidades" (
    "id" SERIAL NOT NULL,
    "fkAsignacion" INTEGER NOT NULL,
    "fkActivoUnidad" INTEGER NOT NULL,

    CONSTRAINT "asignacion_activo_unidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mantenimientos" (
    "id" SERIAL NOT NULL,
    "fkActivoUnidad" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "mantenimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bajas" (
    "id" SERIAL NOT NULL,
    "fkActivoUnidad" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT NOT NULL,

    CONSTRAINT "bajas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "depreciaciones" (
    "id" SERIAL NOT NULL,
    "fkActivoUnidad" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "depreciaciones_pkey" PRIMARY KEY ("id")
);

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

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "personal_ci_key" ON "personal"("ci");

-- CreateIndex
CREATE UNIQUE INDEX "cargos_nombre_key" ON "cargos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "unidades_nombre_key" ON "unidades"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "partidas_codigoPartida_key" ON "partidas"("codigoPartida");

-- CreateIndex
CREATE UNIQUE INDEX "activo_modelos_codigoNuevo_key" ON "activo_modelos"("codigoNuevo");

-- CreateIndex
CREATE UNIQUE INDEX "activo_unidades_codigo_key" ON "activo_unidades"("codigo");

-- AddForeignKey
ALTER TABLE "personal" ADD CONSTRAINT "personal_fkCargo_fkey" FOREIGN KEY ("fkCargo") REFERENCES "cargos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal" ADD CONSTRAINT "personal_fkUnidad_fkey" FOREIGN KEY ("fkUnidad") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activo_modelos" ADD CONSTRAINT "activo_modelos_fkPartida_fkey" FOREIGN KEY ("fkPartida") REFERENCES "partidas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activo_unidades" ADD CONSTRAINT "activo_unidades_fkActivoModelo_fkey" FOREIGN KEY ("fkActivoModelo") REFERENCES "activo_modelos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_fkPersonal_fkey" FOREIGN KEY ("fkPersonal") REFERENCES "personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_fkUsuario_fkey" FOREIGN KEY ("fkUsuario") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignacion_historial" ADD CONSTRAINT "asignacion_historial_fkActivoUnidad_fkey" FOREIGN KEY ("fkActivoUnidad") REFERENCES "activo_unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignacion_historial" ADD CONSTRAINT "asignacion_historial_fkPersonal_fkey" FOREIGN KEY ("fkPersonal") REFERENCES "personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignacion_historial" ADD CONSTRAINT "asignacion_historial_fkUsuario_fkey" FOREIGN KEY ("fkUsuario") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignacion_activo_unidades" ADD CONSTRAINT "asignacion_activo_unidades_fkActivoUnidad_fkey" FOREIGN KEY ("fkActivoUnidad") REFERENCES "activo_unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignacion_activo_unidades" ADD CONSTRAINT "asignacion_activo_unidades_fkAsignacion_fkey" FOREIGN KEY ("fkAsignacion") REFERENCES "asignaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mantenimientos" ADD CONSTRAINT "mantenimientos_fkActivoUnidad_fkey" FOREIGN KEY ("fkActivoUnidad") REFERENCES "activo_unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bajas" ADD CONSTRAINT "bajas_fkActivoUnidad_fkey" FOREIGN KEY ("fkActivoUnidad") REFERENCES "activo_unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depreciaciones" ADD CONSTRAINT "depreciaciones_fkActivoUnidad_fkey" FOREIGN KEY ("fkActivoUnidad") REFERENCES "activo_unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reasignaciones" ADD CONSTRAINT "reasignaciones_fkActivoUnidad_fkey" FOREIGN KEY ("fkActivoUnidad") REFERENCES "activo_unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reasignaciones" ADD CONSTRAINT "reasignaciones_fkPersonalAnterior_fkey" FOREIGN KEY ("fkPersonalAnterior") REFERENCES "personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reasignaciones" ADD CONSTRAINT "reasignaciones_fkPersonalNuevo_fkey" FOREIGN KEY ("fkPersonalNuevo") REFERENCES "personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reasignaciones" ADD CONSTRAINT "reasignaciones_fkUsuarioAnterior_fkey" FOREIGN KEY ("fkUsuarioAnterior") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reasignaciones" ADD CONSTRAINT "reasignaciones_fkUsuarioNuevo_fkey" FOREIGN KEY ("fkUsuarioNuevo") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
