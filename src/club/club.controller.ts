import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, UseInterceptors } from '@nestjs/common';
import { ClubService } from './club.service';
import { ClubDto } from './club.dto';
import { ClubEntity } from './club.entity';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from 'src/shared/interceptors/business-errors.interceptor';

@Controller('clubs')
@UseInterceptors(BusinessErrorsInterceptor)
export class ClubController {
  constructor(private readonly clubService: ClubService) {}

  @Get()
  @HttpCode(200)
  findAll() {
    return this.clubService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  findOne(@Param('id') id: string) {
    return this.clubService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  create(@Body() clubDto: ClubDto) {
    return this.clubService.create(clubDto);
  }

  @Put(':id')
  @HttpCode(200)
  update(@Param('id') id: string, @Body() clubDto: ClubDto) {
    const club: ClubEntity = plainToInstance(ClubEntity, clubDto,);
    return this.clubService.update(id, club);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: string) {
    return this.clubService.delete(id);
  }
}