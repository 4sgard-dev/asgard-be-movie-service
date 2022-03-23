import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Movie } from './Movie';
import { User } from './User';

@Index('rating_id_pkey', ['ratingId'], { unique: true })
@Entity('rating', { schema: 'public' })
export class Rating {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'rating_id' })
  ratingId: number;

  @Column('integer', { name: 'rating' })
  rating: number;

  @Column('text', { name: 'comment', nullable: true })
  comment: string | null;

  @ManyToOne(() => Movie, (movie) => movie.ratings)
  @JoinColumn([{ name: 'movie_id', referencedColumnName: 'movieId' }])
  movie: Movie;

  @Column('integer', { name: 'movie_id' })
  movieId: number;

  @ManyToOne(() => User, (user) => user.ratings)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'userId' }])
  user: User;
}
