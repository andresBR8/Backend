import { Test, TestingModule } from '@nestjs/testing';
import { PruebaNestService } from './prueba_nest.service';

describe('PruebaNestService', () => {
  let service: PruebaNestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PruebaNestService],
    }).compile();

    service = module.get<PruebaNestService>(PruebaNestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
