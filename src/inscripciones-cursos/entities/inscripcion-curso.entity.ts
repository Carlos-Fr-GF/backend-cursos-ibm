import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('inscripciones_cursos')
export class InscripcionCurso {
  @PrimaryGeneratedColumn({ name: 'id_inscripcion', type: 'int' })
  idInscripcion!: number;

  @Column({ name: 'id_curso', type: 'int' })
  idCurso!: number;

  @Column({ name: 'id_datos_personales', type: 'int' })
  idDatosPersonales!: number;

  @Column({ name: 'nivel', type: 'int' })
  nivel!: number;

  @Column({ name: 'id_subnivel', type: 'int', nullable: true })
  subnivel!: number | null;

  @Column({ name: 'dependencia', type: 'int', nullable: true })
  dependencia!: number | null;

  @Column({
    name: 'fecha_registro',
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  fechaRegistro!: string;
}
