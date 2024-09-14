import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberEntity } from './member.entity';
import { MemberDto } from './member.dto';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
  ) {}

  async findAll(): Promise<MemberEntity[]> {
    return await this.memberRepository.find({ relations: ["clubs"] });
  }

  async findOne(id: string): Promise<MemberEntity> {
    const member: MemberEntity = await this.memberRepository.findOne({where: {id}, relations: ['clubs'],} );
    if (!member)
      throw new BusinessLogicException("The member with the given id was not found", BusinessError.NOT_FOUND);

    return member;
  }

  async create(memberDto: MemberDto): Promise<MemberEntity> {
    if (!memberDto.email.includes('@')) {
      throw new BusinessLogicException("Invalid email format", BusinessError.PRECONDITION_FAILED);
    }

    const member = this.memberRepository.create(memberDto);
    return this.memberRepository.save(member);
  }

  async update(id: string, member: MemberEntity): Promise<MemberEntity> {
    const persistedMember: MemberEntity = await this.memberRepository.findOne({where:{id}});
    
    if (member.email && !member.email.includes('@')) {
      throw new BusinessLogicException("Invalid email format", BusinessError.PRECONDITION_FAILED);
    }

    if (!persistedMember)
      throw new BusinessLogicException("The member with the given id was not found", BusinessError.NOT_FOUND);

    return await this.memberRepository.save({...persistedMember, ...member});
  }

  async delete(id: string) {
    const member: MemberEntity = await this.memberRepository.findOne({where:{id}});
    if (!member)
      throw new BusinessLogicException("The member with the given id was not found", BusinessError.NOT_FOUND);
 
    await this.memberRepository.remove(member);
  }
}