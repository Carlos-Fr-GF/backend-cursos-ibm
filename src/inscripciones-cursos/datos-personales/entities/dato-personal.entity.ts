import { Cargo } from '../../../cargos/entities/cargo.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('datos_personales')
export class DatoPersonal {
  @PrimaryGeneratedColumn({ name: 'id_datos_personales', type: 'int' })
  idDatosPersonales!: number;

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

  @Column({ name: 'id_cargo', type: 'int', nullable: true })
  idCargo!: number | null;

  @ManyToOne(() => Cargo, (cargo) => cargo.datosPersonales, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_cargo', referencedColumnName: 'idCargo' })
  cargo!: Cargo | null;
}
