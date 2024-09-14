import { Test, TestingModule } from '@nestjs/testing';
import { ClubService } from './club.service';
import { ClubEntity } from './club.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';

import { faker } from '@faker-js/faker';

describe('ClubService', () => {
  let service: ClubService;
  let clubRepository: Repository<ClubEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubService],
    }).compile();

    service = module.get<ClubService>(ClubService);
    clubRepository = module.get<Repository<ClubEntity>>(getRepositoryToken(ClubEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    
    await clubRepository.clear();  
    
    const clubs = [];
    for (let i = 0; i < 5; i++) {  
      const club = await clubRepository.save({
        name: faker.company.name(),  
        description: faker.lorem.sentence(10),  
        foundationDate: faker.date.past({ years: 30 }).toISOString().split('T')[0],
        image: faker.image.url(),  
      });
  
      clubs.push(club);
    }
  
    return clubs;  
  };  

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  it('findAll should return all clubs', async () => {
    const clubs = await service.findAll();  
    expect(clubs).toHaveLength(5);  
  });
  
  it('findOne should return a club by id', async () => {
    const clubs = await service.findAll();  
    const club = await service.findOne(clubs[0].id);  

    expect(club).toBeDefined();  
    expect(club.name).toBe(clubs[0].name);  
  });
  
  it('create should add a new club', async () => {
    const newClub = {
      name: faker.company.name(),
      description: faker.lorem.sentence(10),
      foundationDate: faker.date.past({ years: 30 }).toISOString().split('T')[0],
      image: faker.image.url(),
    };

    const createdClub = await service.create(newClub);  
    expect(createdClub).toHaveProperty('id');  
    expect(createdClub.name).toEqual(newClub.name);  
  });
  
  it('update should modify a club', async () => {
    const clubs = await service.findAll();  
    const updatedClub = await service.update(clubs[0].id, {...clubs[0], name: 'Updated Club', description: 'Updated description',});

    expect(updatedClub.name).toEqual('Updated Club');  
    expect(updatedClub.description).toEqual('Updated description');  
  });
  
  it('delete should remove a club', async () => {
    const clubs = await service.findAll();  
    await service.delete(clubs[0].id);  

    const remainingClubs = await service.findAll();
    expect(remainingClubs).toHaveLength(4);  
  });

  it('findOne should throw an exception if the club is not found', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'The club with the given id was not found',
    );
  });
  
  it('update should throw an exception if the club is not found', async () => {
    const updateData = {
      id: '00000000-0000-0000-0000-000000000000',  
      name: 'Updated Club',
      description: 'Updated description',
      foundationDate: faker.date.past({ years: 30 }), 
      image: faker.image.url(),  
      members: [],  
    };
  
    await expect(() => service.update('0', updateData)).rejects.toHaveProperty(
      'message',
      'The club with the given id was not found',
    );
  });

  it('create should throw an exception if the description exceeds 100 characters', async () => {
    const newClub = {
      name: faker.company.name(),
      description: faker.lorem.sentence(101),  
      foundationDate: faker.date.past({ years: 30 }).toISOString().split('T')[0],
      image: faker.image.url(),
    };
  
    await expect(() => service.create(newClub)).rejects.toHaveProperty(
      'message',
      'Description exceeds 100 characters',
    );
  });
  
  it('update should throw an exception if the description exceeds 100 characters', async () => {
    const clubs = await service.findAll();  
    const updateData = {
      id: clubs[0].id,  
      name: 'Updated Club',
      description: faker.lorem.sentence(101),  
      foundationDate: faker.date.past({ years: 30 }),
      image: faker.image.url(),
      members: [],
    };
  
    await expect(() => service.update(clubs[0].id, updateData)).rejects.toHaveProperty(
      'message',
      'Description exceeds 100 characters',
    );
  });
  
  it('delete should throw an exception if the club is not found', async () => {
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'The club with the given id was not found',
    );
  });  
});
