import { Test, TestingModule } from '@nestjs/testing';
import { ClubMemberService } from './club-member.service';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ClubEntity } from '../club/club.entity';
import { MemberEntity } from '../member/member.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { faker } from '@faker-js/faker';

describe('ClubMemberService', () => {
  let service: ClubMemberService;
  let clubRepository: Repository<ClubEntity>;
  let memberRepository: Repository<MemberEntity>;
  let club: ClubEntity;
  let membersList: MemberEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubMemberService],
    }).compile();

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
    expect(service).toBeDefined();
  });

  it('addMemberToClub should add a member to a club', async () => {
    const newMember = await memberRepository.save({
      username: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.past(),
    });

    const result = await service.addMemberToClub(club.id, newMember.id);
    const updatedClub = await clubRepository.findOne({
      where: { id: club.id },
      relations: ['members'],
    });

    expect(updatedClub.members.length).toBe(4); // Debe haber 4 miembros ahora
    expect(updatedClub.members.find((m) => m.id === newMember.id)).toBeDefined();
  });

  it('findMembersFromClub should return all members of a club', async () => {
    const result = await service.findMembersFromClub(club.id);
    expect(result).toHaveLength(3);
  });

  it('findMemberFromClub should return a specific member from a club', async () => {
    const member = membersList[0];
    const result = await service.findMemberFromClub(club.id, member.id);
    expect(result).toEqual(member);
  });

  it('findMemberFromClub should throw an exception if the member is not found in the club', async () => {
    await expect(service.findMemberFromClub(club.id, 'non-existent-id')).rejects.toHaveProperty(
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

    const updatedClub = await service.updateMembersFromClub(club.id, [newMember]);
    expect(updatedClub.members.length).toBe(1); // Solo debería haber un miembro ahora
    expect(updatedClub.members[0].id).toBe(newMember.id);
  });

  it('addMemberToClub should throw an exception if the club is not found', async () => {
    const newMember = await memberRepository.save({
      username: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.past(),
    });
  
    await expect(service.addMemberToClub('non-existent-id', newMember.id)).rejects.toHaveProperty(
      'message',
      'The club with the given id was not found',
    );
  });

  it('addMemberToClub should throw an exception if the member is not found', async () => {
    await expect(service.addMemberToClub(club.id, 'non-existent-id')).rejects.toHaveProperty(
      'message',
      'The member with the given id was not found',
    );
  });
  
  it('findMembersFromClub should throw an exception if the club is not found', async () => {
    await expect(service.findMembersFromClub('non-existent-id')).rejects.toHaveProperty(
      'message',
      'The club with the given id was not found',
    );
  });
  
  it('findMemberFromClub should throw an exception if the club is not found', async () => {
    const member = membersList[0];
    await expect(service.findMemberFromClub('non-existent-id', member.id)).rejects.toHaveProperty(
      'message',
      'The club with the given id was not found',
    );
  });

  it('findMemberFromClub should throw an exception if the member is not associated with the club', async () => {
    const newMember = await memberRepository.save({
      username: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.past(),
    });
  
    await expect(service.findMemberFromClub(club.id, newMember.id)).rejects.toHaveProperty(
      'message',
      'The member with the given id was not found in the club',
    );
  });

  it('should throw an exception if the club is not found', async () => {
    const nonExistentClubId = 'non-existent-club-id';
  
    await expect(
      service.updateMembersFromClub(nonExistentClubId, []),
    ).rejects.toHaveProperty(
      'message',
      'The club with the given id was not found',
    );
  });
  
  it('should throw an exception if a member is not found', async () => {
    const allClubs = await clubRepository.find();
    const club = allClubs[0];
  
    const nonExistentMember = {
      id: 'non-existent-member-id',
    } as MemberEntity;
  
    await expect(
      service.updateMembersFromClub(club.id, [nonExistentMember]),
    ).rejects.toHaveProperty(
      'message',
      'One of the members was not found',
    );
  });

  it('deleteMemberFromClub should throw an exception if the club is not found', async () => {
    const member = membersList[0];
  
    await expect(service.deleteMemberFromClub('non-existent-id', member.id)).rejects.toHaveProperty(
      'message',
      'The club with the given id was not found',
    );
  });
  
  it('deleteMemberFromClub should throw an exception if the member is not associated with the club', async () => {
    const newMember = await memberRepository.save({
      username: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.past(),
    });
  
    await expect(service.deleteMemberFromClub(club.id, newMember.id)).rejects.toHaveProperty(
      'message',
      'The member with the given id was not found in the club',
    );
  });  

  it('deleteMemberFromClub should remove a member from a club', async () => {
    const member = membersList[0];

    await service.deleteMemberFromClub(club.id, member.id);

    const updatedClub = await clubRepository.findOne({
      where: { id: club.id },
      relations: ['members'],
    });

    expect(updatedClub.members.length).toBe(2); // Debe haber 2 miembros después de eliminar 1
    expect(updatedClub.members.find((m) => m.id === member.id)).toBeUndefined();
  });
});
