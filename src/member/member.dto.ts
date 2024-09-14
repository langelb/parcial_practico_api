import { IsString, IsEmail, IsNotEmpty, IsDateString } from 'class-validator';

export class MemberDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsDateString()
  birthdate: string;
}
