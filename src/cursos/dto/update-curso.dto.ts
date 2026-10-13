import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateCursoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  fechaInicioInscripcion?: string | null;

  @IsOptional()
  @IsDateString({ strict: true })
  fechaFinInscripcion?: string | null;

  @IsOptional()
  @IsDateString({ strict: true })
  fechaInicioCurso?: string | null;

  @IsOptional()
  @IsDateString({ strict: true })
  fechaFinCurso?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(2147483647)
  cuposMax?: number;
}
