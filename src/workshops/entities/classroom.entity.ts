import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Workshop } from './workshop.entity';

@Entity('classrooms')
export class Classroom {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  name!: string;

  @Column({ type: 'int' })
  capacity!: number;

  @OneToMany(() => Workshop, (workshop) => workshop.classroom)
  workshops!: Workshop[];
}
