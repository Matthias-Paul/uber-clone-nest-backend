import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DriverEntity } from '../../driver/entity/driver.entity';
import { User } from '../../auth/entity/user.entity';

@Entity()
export class RideEntity {
  @PrimaryGeneratedColumn({ name: 'ride_id' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  origin_address: string;

  @Column({ type: 'varchar', length: 255 })
  destination_address: string;

  @Column({ type: 'decimal', precision: 9, scale: 6 })
  origin_latitude: string;

  @Column({ type: 'decimal', precision: 9, scale: 6 })
  origin_longitude: string;

  @Column({ type: 'decimal', precision: 9, scale: 6 })
  destination_latitude: string;

  @Column({ type: 'decimal', precision: 9, scale: 6 })
  destination_longitude: string;

  @Column({ type: 'int' })
  ride_time: number;

  @Column({ type: 'varchar', length: 100 })
  user_email: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  fare_price: string;

  @Column({ type: 'varchar', length: 50 })
  payment_status: string;

  @ManyToOne(() => DriverEntity, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'driver_id' })
  driver: DriverEntity;

  @ManyToOne(() => User, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
