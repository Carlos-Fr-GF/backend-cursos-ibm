import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('cat_roles')
export class Rol {
  @PrimaryColumn({ name: 'id_rol', type: 'int' })
  idRol!: number;

  @Column({ name: 'clave', type: 'varchar', length: 30, nullable: true })
  clave!: string | null;

  @Column({ name: 'rol', type: 'varchar', length: 100, nullable: true })
  rol!: string | null;

  @Column({
    name: 'fecha_registro',
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  fechaRegistro!: Date | null;
}
