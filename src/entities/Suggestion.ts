import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';

@Index('suggestion_pkey', ['suggestionId'], { unique: true })
@Entity('suggestion', { schema: 'public' })
export class Suggestion {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'suggestion_id' })
  suggestionId: number;

  @Column('character varying', { name: 'name', length: 255 })
  name: string;

  @Column('character varying', {
    name: 'imdb_id',
    length: 255,
    default: () => "''",
  })
  imdbId: string;

  @Column('character varying', { name: 'poster_path', length: 255 })
  posterPath: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'userId' }])
  user: User;

  @Column('timestamp with time zone', { name: 'created' })
  created: Date;
}
