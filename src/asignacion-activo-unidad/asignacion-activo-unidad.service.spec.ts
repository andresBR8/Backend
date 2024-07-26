import { Test, TestingModule } from '@nestjs/testing';
import { AsignacionActivoUnidadService } from './asignacion-activo-unidad.service';

describe('AsignacionActivoUnidadService', () => {
  let service: AsignacionActivoUnidadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsignacionActivoUnidadService],
    }).compile();

    service = module.get<AsignacionActivoUnidadService>(AsignacionActivoUnidadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
