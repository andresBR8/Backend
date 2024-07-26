import { Test, TestingModule } from '@nestjs/testing';
import { DepreciacionService } from './depreciacion.service';

describe('DepreciacionService', () => {
  let service: DepreciacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepreciacionService],
    }).compile();

    service = module.get<DepreciacionService>(DepreciacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
