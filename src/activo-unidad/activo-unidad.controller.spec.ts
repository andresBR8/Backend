import { Test, TestingModule } from '@nestjs/testing';
import { ActivoUnidadController } from './activo-unidad.controller';
import { ActivoUnidadService } from './activo-unidad.service';

describe('ActivoUnidadController', () => {
  let controller: ActivoUnidadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivoUnidadController],
      providers: [ActivoUnidadService],
    }).compile();

    controller = module.get<ActivoUnidadController>(ActivoUnidadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
