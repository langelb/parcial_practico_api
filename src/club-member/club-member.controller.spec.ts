import { Test, TestingModule } from '@nestjs/testing';
import { ClubMemberController } from './club-member.controller';
import { ClubMemberService } from './club-member.service';
import { ClubEntity } from '../club/club.entity';
import { MemberEntity } from '../member/member.entity';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';

import { faker } from '@faker-js/faker';

describe('ClubMemberController', () => {
  let controller: ClubMemberController;
  let service: ClubMemberService;
  let clubRepository: Repository<ClubEntity>;
  let memberRepository: Repository<MemberEntity>;
  let club: ClubEntity;
  let membersList: MemberEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      controllers: [ClubMemberController],
      providers: [ClubMemberService],
    }).compile();

    controller = module.get<ClubMemberController>(ClubMemberController);
    service = module.get<ClubMemberService>(ClubMemberService);
    clubRepository = module.get<Repository<ClubEntity>>(getRepositoryToken(ClubEntity));
    memberRepository = module.get<Repository<MemberEntity>>(getRepositoryToken(MemberEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    await memberRepository.clear();
    await clubRepository.clear();

    membersList = [];
    for (let i = 0; i < 3; i++) {
      const member = await memberRepository.save({
        username: faker.internet.userName(),
        email: faker.internet.email(),
        birthdate: faker.date.past(),
      });
      membersList.push(member);
    }

    club = await clubRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      foundationDate: faker.date.past(),
      image: faker.image.url(),
      members: membersList,
    });
  };

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('addMemberToClub should add a member to a club', async () => {
    const newMember = await memberRepository.save({
      username: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.past(),
    });

    const result = await controller.addMemberToClub(club.id, newMember.id);
    const updatedClub = await clubRepository.findOne({
      where: { id: club.id },
      relations: ['members'],
    });

    expect(updatedClub.members.length).toBe(4); 
    expect(updatedClub.members.find((m) => m.id === newMember.id)).toBeDefined();
  });

  it('findMembersFromClub should return all members of a club', async () => {
    const result = await controller.findMembersFromClub(club.id);
    expect(result).toHaveLength(3);
  });

  it('findMemberFromClub should return a specific member from a club', async () => {
    const member = membersList[0];
    const result = await controller.findMemberFromClub(club.id, member.id);
    expect(result).toEqual(member);
  });

  it('findMemberFromClub should throw an exception if the member is not found in the club', async () => {
    await expect(controller.findMemberFromClub(club.id, 'non-existent-id')).rejects.toHaveProperty(
      'message',
      'The member with the given id was not found in the club',
    );
  });

  it('updateMembersFromClub should update the members of a club', async () => {
    const newMember = await memberRepository.save({
      username: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.past(),
    });

    const updatedClub = await controller.updateMembersFromClub(club.id, [newMember]);
    expect(updatedClub.members.length).toBe(1); 
    expect(updatedClub.members[0].id).toBe(newMember.id);
  });

  it('deleteMemberFromClub should remove a member from a club', async () => {
    const member = membersList[0];

    await controller.deleteMemberFromClub(club.id, member.id);

    const updatedClub = await clubRepository.findOne({
      where: { id: club.id },
      relations: ['members'],
    });

    expect(updatedClub.members.length).toBe(2); 
    expect(updatedClub.members.find((m) => m.id === member.id)).toBeUndefined();
  });
});