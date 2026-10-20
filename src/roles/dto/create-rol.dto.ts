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

export class CreateRolDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(2147483647)
  idRol!: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  clave?: string | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  rol?: string | null;
}
