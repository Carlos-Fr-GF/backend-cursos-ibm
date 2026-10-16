import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateDatoPersonalDto {
  @IsOptional()
  @IsString()
  @MaxLength(10)
  cct?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  institucion?: string | null;

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

  @IsOptional()
  @IsEmail()
  @MaxLength(50)
  correo?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  idCargo?: number | null;
}
