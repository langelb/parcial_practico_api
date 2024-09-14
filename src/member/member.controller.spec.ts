import { Test, TestingModule } from '@nestjs/testing';
import { MemberController } from './member.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { MemberService } from './member.service';
import { MemberEntity } from './member.entity';

import { faker } from '@faker-js/faker';

describe('MemberController', () => {
  let controller: MemberController;
  let service: MemberService;
  let repository: Repository<MemberEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      controllers: [MemberController],
      providers: [MemberService],
    }).compile();

    controller = module.get<MemberController>(MemberController);
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
    expect(controller).toBeDefined();
  });

  it('findAll should return all members', async () => {
    const result = await controller.findAll();
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
      birthdate: faker.date.past().toISOString().split('T')[0],  
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

  it('findOne should throw an exception if the member is not found', async () => {
    
    await expect(controller.findOne('non-existent-id')).rejects.toHaveProperty(
      'message',
      'The member with the given id was not found'
    );
  });

  it('delete should throw an exception if the member is not found', async () => {
    
    await expect(controller.delete('non-existent-id')).rejects.toHaveProperty(
      'message',
      'The member with the given id was not found'
    );
  });

  it('create should throw an exception if the member data is invalid', async () => {
    const invalidMemberDto = {
      username: 'invalid-username', 
      email: 'invalid-email', 
      birthdate: 'invalid-date', 
    };  
    
    await expect(controller.create(invalidMemberDto)).rejects.toHaveProperty(
      'message',
      'Invalid email format'
    );
  });
  
  it('update should throw an exception if the member is not found', async () => {
    const updatedMemberDto = {
      username: 'UpdatedUsername',
      email: 'updatedemail@example.com',
      birthdate: new Date(faker.date.past()).toISOString()
    };  
    
    await expect(controller.update('non-existent-id', updatedMemberDto)).rejects.toHaveProperty(
      'message',
      'The member with the given id was not found'
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
