import { Test, TestingModule } from '@nestjs/testing';
import { ActivoModeloController } from './activo-modelo.controller';
import { ActivoModeloService } from './activo-modelo.service';

describe('ActivoModeloController', () => {
  let controller: ActivoModeloController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivoModeloController],
      providers: [ActivoModeloService],
    }).compile();

    controller = module.get<ActivoModeloController>(ActivoModeloController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
