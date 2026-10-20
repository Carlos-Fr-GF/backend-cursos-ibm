import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateRolDto {
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
