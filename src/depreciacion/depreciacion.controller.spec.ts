import { Test, TestingModule } from '@nestjs/testing';
import { DepreciacionController } from './depreciacion.controller';
import { DepreciacionService } from './depreciacion.service';

describe('DepreciacionController', () => {
  let controller: DepreciacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepreciacionController],
      providers: [DepreciacionService],
    }).compile();

    controller = module.get<DepreciacionController>(DepreciacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
