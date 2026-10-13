import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('cat_niveles')
export class Nivel {
  @PrimaryGeneratedColumn({ name: 'id_nivel', type: 'int' })
  idNivel!: number;

  @Column({ name: 'nivel', type: 'varchar', length: 50 })
  nivel!: string;

  @CreateDateColumn({ name: 'fecha_registro', type: 'timestamp' })
  fechaRegistro!: Date;
}
