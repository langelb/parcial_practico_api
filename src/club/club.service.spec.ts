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
    // Limpiar la base de datos antes de insertar nuevos datos
    await clubRepository.clear();
  
    // Generar clubes de prueba usando Faker
    const clubs = [];
    for (let i = 0; i < 5; i++) {  // Crea 5 clubes aleatorios
      const club = await clubRepository.save({
        name: faker.company.name(),  // Nombre aleatorio de la empresa/club
        description: faker.lorem.sentence(10),  // Descripción aleatoria de hasta 10 palabras
        foundationDate: faker.date.past({ years: 30 }).toISOString().split('T')[0],
        image: faker.image.url(),  // URL de una imagen aleatoria
      });
  
      clubs.push(club);
    }
  
    return clubs;  // Retorna los clubes creados
  };
  

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Prueba para obtener todos los clubes generados
  it('findAll should return all clubs', async () => {
    const clubs = await service.findAll();  // Llamar al método findAll
    expect(clubs).toHaveLength(5);  // Debe haber 5 clubes ya que generamos 5 en el seedDatabase()
  });

  // Prueba para encontrar un club por su id
  it('findOne should return a club by id', async () => {
    const clubs = await service.findAll();  // Obtener los clubes generados
    const club = await service.findOne(clubs[0].id);  // Obtener el primer club generado

    expect(club).toBeDefined();  // Asegurarse de que el club existe
    expect(club.name).toBe(clubs[0].name);  // Verificar que el nombre coincide
  });

  // Prueba para crear un nuevo club
  it('create should add a new club', async () => {
    const newClub = {
      name: faker.company.name(),
      description: faker.lorem.sentence(10),
      foundationDate: faker.date.past({ years: 30 }).toISOString().split('T')[0],
      image: faker.image.url(),
    };

    const createdClub = await service.create(newClub);  // Llamar al método create
    expect(createdClub).toHaveProperty('id');  // Asegurarse de que el club tiene un ID
    expect(createdClub.name).toEqual(newClub.name);  // Verificar que el nombre coincide
  });

  // Prueba para actualizar un club
  it('update should modify a club', async () => {
    const clubs = await service.findAll();  // Obtener los clubes generados
    const updatedClub = await service.update(clubs[0].id, {...clubs[0], name: 'Updated Club', description: 'Updated description',});

    expect(updatedClub.name).toEqual('Updated Club');  // Verificar que el nombre ha sido actualizado
    expect(updatedClub.description).toEqual('Updated description');  // Verificar que la descripción ha sido actualizada
  });

  // Prueba para eliminar un club
  it('delete should remove a club', async () => {
    const clubs = await service.findAll();  // Obtener los clubes generados
    await service.delete(clubs[0].id);  // Eliminar el primer club generado

    const remainingClubs = await service.findAll();
    expect(remainingClubs).toHaveLength(4);  // Deberían quedar solo 4 clubes después de eliminar uno
  });

  it('findOne should throw an exception if the club is not found', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'The club with the given id was not found',
    );
  });
  
  it('update should throw an exception if the club is not found', async () => {
    const updateData = {
      id: '00000000-0000-0000-0000-000000000000',  // Proporciona un ID no existente
      name: 'Updated Club',
      description: 'Updated description',
      foundationDate: faker.date.past({ years: 30 }), // Incluye foundationDate
      image: faker.image.url(),  // Incluye image
      members: [],  // Proporciona un array vacío para los members
    };
  
    await expect(() => service.update('0', updateData)).rejects.toHaveProperty(
      'message',
      'The club with the given id was not found',
    );
  });

  it('create should throw an exception if the description exceeds 100 characters', async () => {
    const newClub = {
      name: faker.company.name(),
      description: faker.lorem.sentence(101),  // Descripción de más de 100 caracteres
      foundationDate: faker.date.past({ years: 30 }).toISOString().split('T')[0],
      image: faker.image.url(),
    };
  
    await expect(() => service.create(newClub)).rejects.toHaveProperty(
      'message',
      'Description exceeds 100 characters',
    );
  });
  
  it('update should throw an exception if the description exceeds 100 characters', async () => {
    const clubs = await service.findAll();  // Obtener los clubes generados
    const updateData = {
      id: clubs[0].id,  // Reutilizamos el ID de un club existente
      name: 'Updated Club',
      description: faker.lorem.sentence(101),  // Descripción de más de 100 caracteres
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
