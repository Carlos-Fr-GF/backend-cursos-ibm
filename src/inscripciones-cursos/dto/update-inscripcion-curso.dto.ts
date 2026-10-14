import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

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
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  subnivel?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  dependencia?: number | null;
}
