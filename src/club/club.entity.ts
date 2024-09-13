import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Member } from '../member/member.entity';

@Entity()
export class Club {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  foundationDate: Date;

  @Column()
  image: string;

  @Column({ length: 100 })
  description: string;

  @ManyToMany(() => Member, (member) => member.clubs)
  members: Member[];
}