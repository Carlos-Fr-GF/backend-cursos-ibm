import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateNivelDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nivel?: string;
}
