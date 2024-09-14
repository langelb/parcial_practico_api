import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ClubController } from './club.controller';
import { ClubService } from './club.service';
import { ClubEntity } from './club.entity';

import { faker } from '@faker-js/faker';

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

    await seedDatabase();
  });

  const seedDatabase = async () => {
    await repository.clear(); // Limpiar la base de datos antes de poblarla

    for (let i = 0; i < 3; i++) {
      await repository.save({
        name: faker.company.name(),
        description: faker.lorem.sentence(10),
        foundationDate: faker.date.past(),
        image: faker.image.url(),
        members: [],
      });
    }
  };

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Prueba para findAll (obtener todos los clubes)
  it('findAll should return a list of clubs', async () => {
    const result = await controller.findAll();
    const allClubs = await repository.find(); // Consultar directamente en la base de datos

    allClubs.forEach(club => club.members = []);

    expect(result).toHaveLength(3); // Verifica que haya 3 clubes insertados
    expect(result).toEqual(allClubs); // Verifica que lo devuelto por el controlador sea igual a lo que está en la base de datos
  });

  // Prueba para findOne (obtener un club por ID)
  it('findOne should return a club by id', async () => {
    const allClubs = await repository.find();  // Obtener todos los clubes de la base de datos
    const club = allClubs[0];  // Tomar el primer club

    const result = await controller.findOne(club.id);
    expect(result).toEqual(club);  // Verifica que el resultado sea igual al club obtenido de la base de datos
  });

  // Prueba para create (crear un nuevo club)
  it('create should create a new club', async () => {
    const newClubDto = {
      name: faker.company.name(),
      description: faker.lorem.sentence(10),
      foundationDate: faker.date.past().toISOString().split('T')[0],
      image: faker.image.url(),
    };

    const result = await controller.create(newClubDto);
    const createdClub = await repository.findOne({ where: { id: result.id } }); // Verifica si el club fue creado en la base de datos

    expect(result).toHaveProperty('id');
    expect(result.name).toBe(newClubDto.name);
    expect(result.description).toBe(newClubDto.description);
    expect(createdClub).toBeDefined(); // Verifica que el club exista en la base de datos
  });

  // Prueba para update (actualizar un club)
  it('update should modify a club', async () => {
    const allClubs = await repository.find();  // Obtener todos los clubes de la base de datos
    const club = allClubs[0];

    const updatedClubDto = {
      name: 'Updated Name',
      description: 'Updated Description',
      foundationDate: faker.date.past().toISOString().split('T')[0],
      image: faker.image.url(),
    };

    const result = await controller.update(club.id, updatedClubDto);
    const updatedClub = await repository.findOne({ where: { id: club.id } }); // Verifica que el club fue actualizado en la base de datos

    expect(result.name).toBe(updatedClubDto.name);
    expect(result.description).toBe(updatedClubDto.description);
    expect(updatedClub).toBeDefined(); // Verifica que el club fue actualizado en la base de datos
  });

  // Prueba para delete (eliminar un club)
  it('delete should remove a club', async () => {
    const allClubs = await repository.find();  // Obtener todos los clubes de la base de datos
    const club = allClubs[0];

    await controller.delete(club.id);

    const deletedClub = await repository.findOne({ where: { id: club.id } }); // Verifica que el club fue eliminado de la base de datos
    expect(deletedClub).toBeNull();  // Verifica que el club ya no exista en la base de datos
  });
});
