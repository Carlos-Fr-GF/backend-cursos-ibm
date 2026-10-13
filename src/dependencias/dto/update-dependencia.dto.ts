import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateDependenciaDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idNivel?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  dependencia?: string;
}
