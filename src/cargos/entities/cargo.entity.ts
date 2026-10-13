import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DatoPersonal } from '../../inscripciones-cursos/datos-personales/entities/dato-personal.entity';

@Entity('cat_cargo')
export class Cargo {
  @PrimaryGeneratedColumn({ name: 'id_cargo', type: 'int' })
  idCargo!: number;

  @Column({ name: 'cargo', type: 'varchar', length: 45 })
  cargo!: string;

  @OneToMany(() => DatoPersonal, (datoPersonal) => datoPersonal.cargo)
  datosPersonales!: DatoPersonal[];
}
