import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClubEntity } from '../club/club.entity';
import { MemberEntity } from '../member/member.entity';
import { BusinessLogicException, BusinessError } from '../shared/errors/business-errors';

@Injectable()
export class ClubMemberService {
  constructor(
    @InjectRepository(ClubEntity)
    private readonly clubRepository: Repository<ClubEntity>,

    @InjectRepository(MemberEntity)
    private readonly memberRepository: Repository<MemberEntity>,
  ) {}
  
  async addMemberToClub(clubId: string, memberId: string): Promise<ClubEntity> {
    const member = await this.memberRepository.findOne({ where: { id: memberId } });
    if (!member) {
      throw new BusinessLogicException('The member with the given id was not found', BusinessError.NOT_FOUND);
    }

    const club = await this.clubRepository.findOne({ where: { id: clubId }, relations: ['members'] });
    if (!club) {
      throw new BusinessLogicException('The club with the given id was not found', BusinessError.NOT_FOUND);
    }

    club.members.push(member);
    return this.clubRepository.save(club);
  }
  
  async findMembersFromClub(clubId: string): Promise<MemberEntity[]> {
    const club = await this.clubRepository.findOne({ where: { id: clubId }, relations: ['members'] });
    if (!club) {
      throw new BusinessLogicException('The club with the given id was not found', BusinessError.NOT_FOUND);
    }

    return club.members;
  }
  
  async findMemberFromClub(clubId: string, memberId: string): Promise<MemberEntity> {
    const club = await this.clubRepository.findOne({ where: { id: clubId }, relations: ['members'] });
    if (!club) {
      throw new BusinessLogicException('The club with the given id was not found', BusinessError.NOT_FOUND);
    }

    const member = club.members.find((member) => member.id === memberId);
    if (!member) {
      throw new BusinessLogicException('The member with the given id was not found in the club', BusinessError.NOT_FOUND);
    }

    return member;
  }
  
  async updateMembersFromClub(clubId: string, members: MemberEntity[]): Promise<ClubEntity> {
    const club = await this.clubRepository.findOne({ where: { id: clubId }, relations: ['members'] });
    if (!club) {
      throw new BusinessLogicException('The club with the given id was not found', BusinessError.NOT_FOUND);
    }

    const validMembers = [];
    for (const member of members) {
      const foundMember = await this.memberRepository.findOne({ where: { id: member.id } });
      if (!foundMember) {
        throw new BusinessLogicException('One of the members was not found', BusinessError.NOT_FOUND);
      }
      validMembers.push(foundMember);
    }

    club.members = validMembers;
    return this.clubRepository.save(club);
  }
  
  async deleteMemberFromClub(clubId: string, memberId: string): Promise<void> {
    const club = await this.clubRepository.findOne({ where: { id: clubId }, relations: ['members'] });
    if (!club) {
      throw new BusinessLogicException('The club with the given id was not found', BusinessError.NOT_FOUND);
    }

    const memberIndex = club.members.findIndex((member) => member.id === memberId);
    if (memberIndex === -1) {
      throw new BusinessLogicException('The member with the given id was not found in the club', BusinessError.NOT_FOUND);
    }

    club.members.splice(memberIndex, 1); 
    await this.clubRepository.save(club);
  }
}
