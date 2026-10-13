import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('inscripciones_cursos')
export class InscripcionCurso {
  @PrimaryGeneratedColumn({ name: 'id_inscripcion', type: 'int' })
  idInscripcion!: number;

  @Column({ name: 'id_curso', type: 'int' })
  idCurso!: number;

  @Column({ name: 'curp', type: 'varchar', length: 18, nullable: true })
  curp!: string | null;

  @Column({ name: 'nivel', type: 'int' })
  nivel!: number;

  @Column({ name: 'subnivel', type: 'int', nullable: true })
  subnivel!: number | null;

  @Column({ name: 'dependencia', type: 'int', nullable: true })
  dependencia!: number | null;
}
