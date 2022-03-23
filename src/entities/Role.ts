import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';

@Index('role_pkey', ['roleId'], { unique: true })
@Entity('role', { schema: 'public' })
export class Role {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'role_id' })
  roleId: number;

  @Column('character varying', { name: 'name', length: 255 })
  name: string;

  @ManyToMany(() => User, (user) => user.roles)
  @JoinTable({
    name: 'user_roles',
    joinColumns: [{ name: 'role_id', referencedColumnName: 'roleId' }],
    inverseJoinColumns: [{ name: 'user_id', referencedColumnName: 'userId' }],
    schema: 'public',
  })
  users: User[];
}
