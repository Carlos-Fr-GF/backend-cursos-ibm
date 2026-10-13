import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateInscripcionCursoDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idCurso?: number;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @Length(18, 18)
  curp?: string;

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
