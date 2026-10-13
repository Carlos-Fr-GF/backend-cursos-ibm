import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateAsignacionCursoDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idCurso?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idNivel?: number;

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
  dependencias?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(2147483647)
  cupo?: number;
}
