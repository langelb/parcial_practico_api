import { Module } from '@nestjs/common';
import { MemberClubService } from './member-club.service';

@Module({
  providers: [MemberClubService]
})
export class MemberClubModule {}
