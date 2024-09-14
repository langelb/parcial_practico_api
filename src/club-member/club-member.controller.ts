import { Controller, Param, Body, Post, Get, Put, Delete, HttpCode, UseInterceptors } from '@nestjs/common';
import { ClubMemberService } from './club-member.service';
import { MemberEntity } from '../member/member.entity';
import { ClubEntity } from '../club/club.entity';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';

@Controller('clubs')
@UseInterceptors(BusinessErrorsInterceptor)
export class ClubMemberController {
  constructor(private readonly clubMemberService: ClubMemberService) {}

  @Post(':clubId/members/:memberId')
  @HttpCode(201)
  async addMemberToClub(@Param('clubId') clubId: string, @Param('memberId') memberId: string) {
    return await this.clubMemberService.addMemberToClub(clubId, memberId);
  }

  @Get(':clubId/members')
  @HttpCode(200)
  async findMembersFromClub(@Param('clubId') clubId: string): Promise<MemberEntity[]> {
    return await this.clubMemberService.findMembersFromClub(clubId);
  }

  @Get(':clubId/members/:memberId')
  @HttpCode(200)
  async findMemberFromClub(@Param('clubId') clubId: string, @Param('memberId') memberId: string): Promise<MemberEntity> {
    return await this.clubMemberService.findMemberFromClub(clubId, memberId);
  }

  @Put(':clubId/members')
  @HttpCode(200)
  async updateMembersFromClub(@Param('clubId') clubId: string, @Body() members: MemberEntity[]): Promise<ClubEntity> {
    return await this.clubMemberService.updateMembersFromClub(clubId, members);
  }

  @Delete(':clubId/members/:memberId')
  @HttpCode(204)
  async deleteMemberFromClub(@Param('clubId') clubId: string, @Param('memberId') memberId: string) {
    return await this.clubMemberService.deleteMemberFromClub(clubId, memberId);
  }
}
