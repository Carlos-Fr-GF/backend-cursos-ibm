import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cursos')
export class Curso {
  @PrimaryGeneratedColumn({ name: 'id_curso', type: 'int' })
  idCurso!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ name: 'fecha_inicio_inscripcion', type: 'date', nullable: true })
  fechaInicioInscripcion!: string | null;

  @Column({ name: 'fecha_fin_inscripcion', type: 'date', nullable: true })
  fechaFinInscripcion!: string | null;

  @Column({ name: 'fecha_inicio_curso', type: 'date', nullable: true })
  fechaInicioCurso!: string | null;

  @Column({ name: 'fecha_fin_curso', type: 'date', nullable: true })
  fechaFinCurso!: string | null;

  @Column({ name: 'cupos_max', type: 'int' })
  cuposMax!: number;
}
