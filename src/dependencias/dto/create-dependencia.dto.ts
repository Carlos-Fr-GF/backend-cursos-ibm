import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateDependenciaDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idNivel!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  dependencia!: string;
}
