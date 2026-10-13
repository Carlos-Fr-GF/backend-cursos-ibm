import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { CreateDatoPersonalDto } from '../datos-personales/dto/create-dato-personal.dto';

export class CreateInscripcionCursoDto extends CreateDatoPersonalDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idCurso!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  nivel!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  subnivel?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  dependencia?: number | null;
}
