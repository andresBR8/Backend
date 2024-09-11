import { Test, TestingModule } from '@nestjs/testing';
import { EstadoActivoController } from './estado-activo.controller';
import { EstadoActivoService } from './estado-activo.service';

describe('EstadoActivoController', () => {
  let controller: EstadoActivoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadoActivoController],
      providers: [EstadoActivoService],
    }).compile();

    controller = module.get<EstadoActivoController>(EstadoActivoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
