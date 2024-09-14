import { Module } from '@nestjs/common';
import { ClubMemberService } from './club-member.service';
import { ClubMemberController } from './club-member.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubEntity } from '../club/club.entity';
import { MemberEntity } from '../member/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClubEntity, MemberEntity])],
  providers: [ClubMemberService],
  controllers: [ClubMemberController]
})
export class ClubMemberModule {}
