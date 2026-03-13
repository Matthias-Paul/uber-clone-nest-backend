import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dtos/create-driver.dto';
import { UpdateDriverDto } from './dtos/update-driver.dto';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';

@Controller('driver')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post()
  public async createDriver(@Body() createDriverDto: CreateDriverDto) {
    return this.driverService.createDriver(createDriverDto);
  }

  @Patch()
  public async UpdateDriver(
    @Body() updateDriverDto: UpdateDriverDto,
    @ActiveUser() user,
  ) {
    return this.driverService.updateDriver(updateDriverDto, user);
  }

  @Get()
  public async getDrivers() {
    return this.driverService.getDrivers();
  }
}
