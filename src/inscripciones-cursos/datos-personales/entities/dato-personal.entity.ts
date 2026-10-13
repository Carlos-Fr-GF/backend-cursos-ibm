import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('datos_personales')
export class DatoPersonal {
  @PrimaryColumn({ name: 'curp', type: 'varchar', length: 18 })
  curp!: string;

  @Column({ name: 'cct', type: 'varchar', length: 10, nullable: true })
  cct!: string | null;

  @Column({ name: 'escuela', type: 'varchar', length: 50, nullable: true })
  escuela!: string | null;

  @Column({ name: 'nombre', type: 'varchar', length: 30, nullable: true })
  nombre!: string | null;

  @Column({ name: 'ap_paterno', type: 'varchar', length: 30, nullable: true })
  apPaterno!: string | null;

  @Column({ name: 'am_materno', type: 'varchar', length: 30, nullable: true })
  amMaterno!: string | null;

  @Column({ name: 'correo', type: 'varchar', length: 50, nullable: true })
  correo!: string | null;
}
