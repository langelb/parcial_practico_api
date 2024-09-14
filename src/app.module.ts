import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemberModule } from './member/member.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubModule } from './club/club.module';
import { MemberClubModule } from './member-club/member-club.module';

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
    MemberClubModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
