import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCargoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(45)
  cargo!: string;
}
