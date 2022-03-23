import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';
import { Movie } from './Movie';

@Index('event_pkey', ['eventId'], { unique: true })
@Entity('event', { schema: 'public' })
export class Event {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'event_id' })
  eventId: number;

  @Column('timestamp with time zone', { name: 'time' })
  time: Date;

  @ManyToMany(() => User, (user) => user.events)
  @JoinTable({
    name: 'attendee',
    joinColumns: [{ name: 'event_id', referencedColumnName: 'eventId' }],
    inverseJoinColumns: [{ name: 'user_id', referencedColumnName: 'userId' }],
    schema: 'public',
  })
  users: User[];

  @ManyToOne(() => Movie, (movie) => movie.events, { onDelete: 'SET NULL' })
  @JoinColumn([{ name: 'movie_id', referencedColumnName: 'movieId' }])
  movie: Movie;
}
