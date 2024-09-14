import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemberModule } from './member/member.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubModule } from './club/club.module';
import { ClubMemberModule } from './club-member/club-member.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'club-social.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      keepConnectionAlive: true
    }),
    MemberModule,
    ClubModule,
    ClubMemberModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
