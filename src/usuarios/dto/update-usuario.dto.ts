import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  idRol?: number;

  @IsOptional()
  @IsString()
  @MaxLength(25)
  nombre?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(25)
  apPaterno?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(25)
  apMaterno?: string | null;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  correo?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  password?: string;
}
