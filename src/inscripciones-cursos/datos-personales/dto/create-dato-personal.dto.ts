import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDatoPersonalDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(18)
  @MaxLength(18)
  curp!: string;

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
