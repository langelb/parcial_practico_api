import { IsString, IsNotEmpty, IsDateString, MaxLength } from 'class-validator';

export class ClubDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  foundationDate: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @MaxLength(100)
  description: string;
}