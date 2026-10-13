import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('cat_dependencias')
export class Dependencia {
  @PrimaryGeneratedColumn({ name: 'id_dependencias', type: 'int' })
  idDependencias!: number;

  @Column({ name: 'id_nivel', type: 'int' })
  idNivel!: number;

  @Column({ name: 'dependencia', type: 'varchar', length: 50 })
  dependencia!: string;

  @CreateDateColumn({ name: 'fecha_registro', type: 'timestamp' })
  fechaRegistro!: Date;
}
