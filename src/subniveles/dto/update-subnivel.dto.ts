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

export class UpdateSubnivelDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  idNivel?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  subnivel?: string | null;
}
