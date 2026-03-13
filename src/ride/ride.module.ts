import { Module } from '@nestjs/common';
import { RideController } from './ride.controller';
import { RideService } from './ride.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RideEntity } from './entity/ride.entity';
import { DriverEntity } from '../driver/entity/driver.entity';
import { User } from '../auth/entity/user.entity';

@Module({
  controllers: [RideController],
  providers: [RideService],
  imports: [TypeOrmModule.forFeature([RideEntity, DriverEntity, User])],
})
export class RideModule {}
