import { Test, TestingModule } from '@nestjs/testing';
import { BajaController } from './baja.controller';
import { BajaService } from './baja.service';

describe('BajaController', () => {
  let controller: BajaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BajaController],
      providers: [BajaService],
    }).compile();

    controller = module.get<BajaController>(BajaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
