import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateInscripcionCursoDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idCurso?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  nivel?: number;

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
