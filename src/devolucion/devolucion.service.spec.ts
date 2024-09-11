import { Test, TestingModule } from '@nestjs/testing';
import { DevolucionService } from './devolucion.service';

describe('DevolucionService', () => {
  let service: DevolucionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DevolucionService],
    }).compile();

    service = module.get<DevolucionService>(DevolucionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
