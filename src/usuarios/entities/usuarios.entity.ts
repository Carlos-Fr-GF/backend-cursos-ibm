import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tbl_usuarios')
export class Usuario {
  @PrimaryGeneratedColumn({
    name: 'id_usuario',
    type: 'int',
  })
  idUsuario!: number;

  @Column({
    name: 'id_rol',
    type: 'int',
  })
  idRol!: number;

  @Column({
    name: 'nombre',
    type: 'varchar',
    length: 25,
    nullable: true,
  })
  nombre!: string | null;

  @Column({
    name: 'ap_paterno',
    type: 'varchar',
    length: 25,
    nullable: true,
  })
  apPaterno!: string | null;

  @Column({
    name: 'ap_Materno',
    type: 'varchar',
    length: 25,
    nullable: true,
  })
  apMaterno!: string | null;

  @Column({
    name: 'correo',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  correo!: string | null;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  passwordHash!: string | null;

  @Column({
    name: 'activo',
    type: 'boolean',
    default: true,
  })
  activo!: boolean;

  @Column({
    name: 'ultimo_acceso',
    type: 'datetime',
    nullable: true,
  })
  ultimoAcceso!: Date | null;

  @CreateDateColumn({
    name: 'fecha_creacion',
    type: 'timestamp',
  })
  fechaCreacion!: Date;
}
