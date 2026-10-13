import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateNivelDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nivel!: string;
}
