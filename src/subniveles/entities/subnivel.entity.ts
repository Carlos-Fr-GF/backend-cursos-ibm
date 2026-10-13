import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('cat_subniveles')
export class Subnivel {
  @PrimaryColumn({ name: 'id_subnivel', type: 'int' })
  idSubnivel!: number;

  @Column({ name: 'id_nivel', type: 'int' })
  idNivel!: number;

  @Column({ name: 'subnivel', type: 'varchar', length: 50, nullable: true })
  subnivel!: string | null;

  @CreateDateColumn({
    name: 'fecha_registro',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaRegistro!: Date;
}
