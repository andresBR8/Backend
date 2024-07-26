import { Test, TestingModule } from '@nestjs/testing';
import { AsignacionActivoUnidadController } from './asignacion-activo-unidad.controller';
import { AsignacionActivoUnidadService } from './asignacion-activo-unidad.service';

describe('AsignacionActivoUnidadController', () => {
  let controller: AsignacionActivoUnidadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AsignacionActivoUnidadController],
      providers: [AsignacionActivoUnidadService],
    }).compile();

    controller = module.get<AsignacionActivoUnidadController>(AsignacionActivoUnidadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
