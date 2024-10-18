import { Test, TestingModule } from '@nestjs/testing';
import { PruebaNestController } from './prueba_nest.controller';
import { PruebaNestService } from './prueba_nest.service';

describe('PruebaNestController', () => {
  let controller: PruebaNestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PruebaNestController],
      providers: [PruebaNestService],
    }).compile();

    controller = module.get<PruebaNestController>(PruebaNestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
