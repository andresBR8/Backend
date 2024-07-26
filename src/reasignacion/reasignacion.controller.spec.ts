import { Test, TestingModule } from '@nestjs/testing';
import { ReasignacionController } from './reasignacion.controller';
import { ReasignacionService } from './reasignacion.service';

describe('ReasignacionController', () => {
  let controller: ReasignacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReasignacionController],
      providers: [ReasignacionService],
    }).compile();

    controller = module.get<ReasignacionController>(ReasignacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
