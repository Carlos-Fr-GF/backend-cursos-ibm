import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDatoPersonalDto {
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

  @IsOptional()
  @IsEmail()
  @MaxLength(50)
  correo?: string | null;
}
