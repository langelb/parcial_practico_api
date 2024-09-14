import { Test, TestingModule } from '@nestjs/testing';
import { MemberClubService } from './member-club.service';

describe('MemberClubService', () => {
  let service: MemberClubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemberClubService],
    }).compile();

    service = module.get<MemberClubService>(MemberClubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
