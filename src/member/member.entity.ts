import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { ClubEntity } from '../club/club.entity';

@Entity()
export class MemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  birthdate: Date;

  @ManyToMany(() => ClubEntity, (club) => club.members)
  @JoinTable()
  clubs: ClubEntity[];
}