import { Test, TestingModule } from '@nestjs/testing';
import { ReasignacionService } from './reasignacion.service';

describe('ReasignacionService', () => {
  let service: ReasignacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReasignacionService],
    }).compile();

    service = module.get<ReasignacionService>(ReasignacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
