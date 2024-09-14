import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClubEntity } from './club.entity';
import { ClubDto } from './club.dto';
import { BusinessError, BusinessLogicException } from 'src/shared/errors/business-errors';

@Injectable()
export class ClubService {
  constructor(
    @InjectRepository(ClubEntity)
    private clubRepository: Repository<ClubEntity>,
  ) {}

  async findAll(): Promise<ClubEntity[]> {
    return this.clubRepository.find({ relations: ["members"] });
  }

  async findOne(id: string): Promise<ClubEntity> {
    const club = await this.clubRepository.findOne({where: {id}});
    if (!club) {
      throw new BusinessLogicException("The club with the given id was not found", BusinessError.NOT_FOUND);
    }
    return club;
  }

  async create(clubDto: ClubDto): Promise<ClubEntity> {
    if (clubDto.description.length > 100) {
      throw new BusinessLogicException("Description exceeds 100 characters", BusinessError.PRECONDITION_FAILED);
    }

    const club = this.clubRepository.create(clubDto);
    return this.clubRepository.save(club);
  }

  async update(id: string, club: ClubEntity): Promise<ClubEntity> {
    const persistedClub: ClubEntity = await this.clubRepository.findOne({where:{id}});

    if (club.description && club.description.length > 100) {
      throw new BusinessLogicException("Description exceeds 100 characters", BusinessError.PRECONDITION_FAILED);
    }

    if (!persistedClub)
      throw new BusinessLogicException("The club with the given id was not found", BusinessError.NOT_FOUND);

    return await this.clubRepository.save({...persistedClub, ...club});
  }

  async delete(id: string): Promise<void> {
    const club: ClubEntity = await this.clubRepository.findOne({where:{id}});
    if (!club)
      throw new BusinessLogicException("The club with the given id was not found", BusinessError.NOT_FOUND);

    await this.clubRepository.remove(club);
  }
}