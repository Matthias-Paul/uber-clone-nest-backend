import {
    Check,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entity/user.entity';

@Entity()
@Check(`"rating" >= 1 AND "rating" <= 5`)
export class DriverEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 100,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 24,
    unique: false,
  })
  username: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 300,
  })
  profile_image_url?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 300,
  })
  car_image_url?: string;

  @Column({
    type: 'float',
    nullable: true,
  })
  rating?: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  car_seat?: number;

  @OneToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
