import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('asignaciones_cursos')
export class AsignacionCurso {
  @PrimaryGeneratedColumn({ name: 'id_asignacion', type: 'int' })
  idAsignacion!: number;

  @Column({ name: 'id_curso', type: 'int' })
  idCurso!: number;

  @Column({ name: 'id_nivel', type: 'int' })
  idNivel!: number;

  @Column({ name: 'subnivel', type: 'int', nullable: true })
  subnivel!: number | null;

  @Column({ name: 'dependencias', type: 'int', nullable: true })
  dependencias!: number | null;

  @Column({ name: 'cupo', type: 'int' })
  cupo!: number;
}
