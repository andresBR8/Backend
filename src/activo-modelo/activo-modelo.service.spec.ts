import { Test, TestingModule } from '@nestjs/testing';
import { ActivoModeloService } from './activo-modelo.service';

describe('ActivoModeloService', () => {
  let service: ActivoModeloService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivoModeloService],
    }).compile();

    service = module.get<ActivoModeloService>(ActivoModeloService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
