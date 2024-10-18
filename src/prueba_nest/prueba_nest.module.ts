import { Module } from '@nestjs/common';
import { PruebaNestService } from './prueba_nest.service';
import { PruebaNestController } from './prueba_nest.controller';

@Module({
  controllers: [PruebaNestController],
  providers: [PruebaNestService],
})
export class PruebaNestModule {}
