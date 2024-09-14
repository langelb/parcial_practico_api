import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from './member.service';
import { MemberEntity } from './member.entity';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';

import { faker } from '@faker-js/faker';

describe('MemberService', () => {
  let service: MemberService;
  let repository: Repository<MemberEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [MemberService],
    }).compile();

    service = module.get<MemberService>(MemberService);
    repository = module.get<Repository<MemberEntity>>(getRepositoryToken(MemberEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    await repository.clear();

    for (let i = 0; i < 3; i++) {
      await repository.save({
        username: faker.internet.userName(),
        email: faker.internet.email(),
        birthdate: faker.date.past().toISOString().split('T')[0],
        clubs: [],
      });
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all members', async () => {
    const result = await service.findAll();
    const allMembers = await repository.find();

    allMembers.forEach(member => member.clubs = []);

    expect(result).toHaveLength(3);
    expect(result).toEqual(allMembers);
  });

  it('findOne should return a member by id', async () => {
    const allMembers = await repository.find();
    const member = allMembers[0];

    member.clubs = [];

    const result = await service.findOne(member.id);
    expect(result).toEqual(member);
  });

  it('create should add a new member', async () => {
    const newMemberDto = {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.past().toISOString().split('T')[0],  // Convertimos a string
    };

    const result = await service.create(newMemberDto);
    const createdMember = await repository.findOne({ where: { id: result.id } });

    expect(result).toHaveProperty('id');
    expect(result.username).toBe(newMemberDto.username);
    expect(result.email).toBe(newMemberDto.email);
    expect(createdMember).toBeDefined();
  });

  it('update should modify a member', async () => {
    const allMembers = await repository.find();
    const member = allMembers[0];

    const updatedMemberDto = {
      id: member.id,
      username: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: new Date(faker.date.past()),
      clubs: member.clubs || [],
    };

    const result = await service.update(member.id, updatedMemberDto);
    const updatedMember = await repository.findOne({ where: { id: member.id } });

    expect(result.username).toBe(updatedMemberDto.username);
    expect(result.email).toBe(updatedMemberDto.email);
    expect(updatedMember).toBeDefined();
  });

  it('update should throw an exception if the email format is invalid', async () => {
    const allMembers = await repository.find();
    const member = allMembers[0];
  
    const updatedMemberDto = {
      id: member.id,
      username: faker.internet.userName(),
      email: 'invalidemailformat',
      birthdate: new Date(faker.date.past()),
      clubs: member.clubs || [],
    };
  
    await expect(service.update(member.id, updatedMemberDto)).rejects.toHaveProperty(
      'message',
      'Invalid email format',
    );
  });
  

  it('delete should remove a member', async () => {
    const allMembers = await repository.find();
    const member = allMembers[0];

    await service.delete(member.id);

    const deletedMember = await repository.findOne({ where: { id: member.id } });
    expect(deletedMember).toBeNull();
  });
});
