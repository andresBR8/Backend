import { Test, TestingModule } from '@nestjs/testing';
import { EstadoActivoService } from './estado-activo.service';

describe('EstadoActivoService', () => {
  let service: EstadoActivoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstadoActivoService],
    }).compile();

    service = module.get<EstadoActivoService>(EstadoActivoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
