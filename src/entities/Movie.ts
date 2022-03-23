import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from './Event';
import { Rating } from './Rating';

@Index('movie_pkey', ['movieId'], { unique: true })
@Entity('movie', { schema: 'public' })
export class Movie {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'movie_id' })
  movieId: number;

  @Column('character varying', { name: 'name', length: 255 })
  name: string;

  @Column('character varying', {
    name: 'imdb_id',
    length: 255,
    default: () => "''",
  })
  imdbId: string;

  @OneToMany(() => Event, (event) => event.movie)
  events: Event[];

  @OneToMany(() => Rating, (rating) => rating.movie)
  ratings: Rating[];
}
