import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { MemberEntity } from '../member/member.entity';

@Entity()
export class ClubEntity {
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

  @ManyToMany(() => MemberEntity, (member) => member.clubs)
  members: MemberEntity[];
}