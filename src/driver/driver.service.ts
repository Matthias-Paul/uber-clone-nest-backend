import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DriverEntity } from './entity/driver.entity';
import { Repository } from 'typeorm';
import { CreateDriverDto } from './dtos/create-driver.dto';
import { User } from '../auth/entity/user.entity';
import { UserRole } from '../common/enums';
import { UpdateDriverDto } from './dtos/update-driver.dto';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(DriverEntity)
    private driverRepository: Repository<DriverEntity>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  public async createDriver(createDriverDto: CreateDriverDto) {
    const user = await this.userRepository.findOne({
      where: { email: createDriverDto.email },
    });

    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }

    if (!user.verify_user) {
      throw new BadRequestException(
        'Email must be verified before creating a driver profile',
      );
    }

    if (user.role !== UserRole.DRIVER) {
      throw new BadRequestException(
        'User role must be driver to create a driver profile',
      );
    }

    return this.createDriverForUser(user, createDriverDto);
  }

  public async createDriverForUser(
    user: User,
    payload?: Partial<CreateDriverDto>,
  ) {
    if (!user.verify_user) {
      throw new BadRequestException(
        'User must verify email before creating a driver profile',
      );
    }

    const existingDriver = await this.driverRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (existingDriver) {
      throw new BadRequestException(
        'Driver profile already exists for this user',
      );
    }

    const driver = this.driverRepository.create({
      ...payload,
      // Align stored identity with the linked user to avoid divergence
      email: user.email,
      username: user.username,
      user,
    });

    const savedDriver = await this.driverRepository.save(driver);

    if (user.role !== UserRole.DRIVER) {
      user.role = UserRole.DRIVER;
      await this.userRepository.save(user);
    }

    return savedDriver;
  }

  public async updateDriver(
    updateDriverDto: UpdateDriverDto,
    currentUser?: User,
  ) {
    const {
      driver_id,
      email,
      username,
      profile_image_url,
      car_image_url,
      rating,
      car_seat,
    } = updateDriverDto;

    const driver = await this.driverRepository.findOne({
      where: { id: driver_id },
      relations: ['user'],
    });

    if (!driver) {
      throw new BadRequestException('Driver profile not found');
    }

    const owner = driver.user;

    if (!currentUser || currentUser.id !== owner.id) {
      throw new BadRequestException(
        'You are not authorized to edit this profile',
      );
    }

    if (!owner.verify_user) {
      throw new BadRequestException(
        'User must verify email before updating driver profile',
      );
    }

    if (email && email !== driver.email) {
      const userWithEmail = await this.userRepository.findOne({
        where: { email },
      });

      if (userWithEmail && userWithEmail.id !== owner.id) {
        throw new BadRequestException('Email already in use by another user');
      }

      const driverWithEmail = await this.driverRepository.findOne({
        where: { email },
      });

      if (driverWithEmail && driverWithEmail.id !== driver.id) {
        throw new BadRequestException(
          'Driver profile already exists with this email',
        );
      }

      owner.email = email;
      driver.email = email;
    }

    if (username && username !== driver.username) {
      owner.username = username;
      driver.username = username;
    }

    if (typeof profile_image_url !== 'undefined') {
      driver.profile_image_url = profile_image_url;
    }

    if (typeof car_image_url !== 'undefined') {
      driver.car_image_url = car_image_url;
    }

    if (typeof rating !== 'undefined') {
      driver.rating = rating;
    }

    if (typeof car_seat !== 'undefined') {
      driver.car_seat = car_seat;
    }

    if (owner.role !== UserRole.DRIVER) {
      owner.role = UserRole.DRIVER;
    }

    await this.userRepository.save(owner);
    return this.driverRepository.save(driver);
  }

  public getDrivers() {
    return this.driverRepository.find();
  }
}
