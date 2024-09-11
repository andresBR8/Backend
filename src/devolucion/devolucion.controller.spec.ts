import { Test, TestingModule } from '@nestjs/testing';
import { DevolucionController } from './devolucion.controller';
import { DevolucionService } from './devolucion.service';

describe('DevolucionController', () => {
  let controller: DevolucionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevolucionController],
      providers: [DevolucionService],
    }).compile();

    controller = module.get<DevolucionController>(DevolucionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
