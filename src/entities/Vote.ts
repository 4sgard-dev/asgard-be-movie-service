import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';
import { Suggestion } from './Suggestion';

@Index('vote_pkey', ['voteId'], { unique: true })
@Entity('vote', { schema: 'public' })
export class Vote {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'vote_id' })
  voteId: number;

  @Column('boolean', { name: 'interest' })
  interest: boolean;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'userId' }])
  user: User;

  @ManyToOne(() => Suggestion, { onDelete: 'SET NULL' })
  @JoinColumn([{ name: 'suggestion_id', referencedColumnName: 'suggestionId' }])
  suggestion: Suggestion;

  @Column('text', { name: 'comment', nullable: true })
  comment: string | null;

  @Column('timestamp with time zone', { name: 'created' })
  created: Date;
}
