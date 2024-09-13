import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Club } from '../club/club.entity';

@Entity()
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  birthdate: Date;

  @ManyToMany(() => Club, (club) => club.members)
  @JoinTable()
  clubs: Club[];
}