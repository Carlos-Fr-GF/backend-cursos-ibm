import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Max,
  MaxLength,
  Min,
  IsString,
} from 'class-validator';

export class CreateInscripcionCursoDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(50)
  correo!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  idCargo?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  cct?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  escuela?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  nombre?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  apPaterno?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  amMaterno?: string | null;

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
