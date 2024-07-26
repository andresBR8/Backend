import { Test, TestingModule } from '@nestjs/testing';
import { ActivoUnidadService } from './activo-unidad.service';

describe('ActivoUnidadService', () => {
  let service: ActivoUnidadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivoUnidadService],
    }).compile();

    service = module.get<ActivoUnidadService>(ActivoUnidadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
