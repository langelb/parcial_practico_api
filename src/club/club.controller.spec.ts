import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ClubController } from './club.controller';
import { ClubService } from './club.service';
import { ClubEntity } from './club.entity';

describe('ClubController', () => {
  let controller: ClubController;
  let service: ClubService;
  let repository: Repository<ClubEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      controllers: [ClubController],
      providers: [ClubService],
    }).compile();

    controller = module.get<ClubController>(ClubController);
    service = module.get<ClubService>(ClubService);
    repository = module.get<Repository<ClubEntity>>(getRepositoryToken(ClubEntity),);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
