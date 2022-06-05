import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';
import { Vote } from './Vote';
import { ColumnNumericTransformer } from '../utils/utils';

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

  @OneToMany(() => Vote, (vote) => vote.suggestion)
  votes: Vote[];

  @Column('timestamp with time zone', { name: 'created' })
  created: Date;

  @Column({ select: false, transformer: new ColumnNumericTransformer() })
  interested: number;

  @Column({ select: false, transformer: new ColumnNumericTransformer() })
  notInterested: number;
}
