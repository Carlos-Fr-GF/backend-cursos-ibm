import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCargoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(45)
  cargo?: string;
}
