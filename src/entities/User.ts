import {
  Column,
  Entity,
  Index,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from './Event';
import { Rating } from './Rating';
import { Role } from './Role';

@Index('user_pkey', ['userId'], { unique: true })
@Entity('user', { schema: 'public' })
export class User {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'user_id' })
  userId: number;

  @Column('character varying', { name: 'username', length: 255 })
  username: string;

  @Column('character varying', {
    name: 'email',
    nullable: true,
    length: 255,
    select: false,
  })
  email: string | null;

  @ManyToMany(() => Event, (event) => event.users)
  events: Event[];

  @OneToMany(() => Rating, (rating) => rating.user)
  ratings: Rating[];

  @ManyToMany(() => Role, (role) => role.users)
  roles: Role[];
}
