import { Module } from '@nestjs/common';
import { DriverService } from './driver.service';
import { DriverController } from './driver.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverEntity } from './entity/driver.entity';
import { User } from '../auth/entity/user.entity';

@Module({
  providers: [DriverService],
  controllers: [DriverController],
  imports: [TypeOrmModule.forFeature([DriverEntity, User])],
  exports: [DriverService],
})
export class DriverModule {}
