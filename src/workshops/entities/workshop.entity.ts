import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { Classroom } from './classroom.entity';

@Entity('workshops')
export class Workshop {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'timestamptz' })
  date!: Date;

  @Column({ type: 'int' })
  maxParticipants!: number;

  @ManyToOne(() => Classroom, (classroom) => classroom.workshops, { eager: true, nullable: false })
  @JoinColumn({ name: 'classroom_id' })
  classroom!: Classroom;

  @OneToMany(() => Booking, (booking) => booking.workshop)
  bookings!: Booking[];
}
