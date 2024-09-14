import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, UseInterceptors } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberDto } from './member.dto';
import { MemberEntity } from './member.entity';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from 'src/shared/interceptors/business-errors.interceptor';

@Controller('members')
@UseInterceptors(BusinessErrorsInterceptor)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  @HttpCode(200)
  findAll() {
    return this.memberService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  findOne(@Param('id') id: string) {
    return this.memberService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  create(@Body() memberDto: MemberDto) {
    return this.memberService.create(memberDto);
  }

  @Put(':id')
  @HttpCode(200)
  async update(@Param('id') id: string, @Body() memberDto: MemberDto) {
    const member: MemberEntity = plainToInstance(MemberEntity, memberDto,);
    return await this.memberService.update(id, member);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: string) {
    return this.memberService.delete(id);
  }
}
