import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { Classroom } from './entities/classroom.entity';
import { Workshop } from './entities/workshop.entity';

@Injectable()
export class WorkshopsService {
  constructor(
    @InjectRepository(Workshop) private readonly workshops: Repository<Workshop>,
    @InjectRepository(Classroom) private readonly classrooms: Repository<Classroom>,
  ) {}

  findAll(): Promise<Workshop[]> {
    return this.workshops.find({ relations: { classroom: true }, order: { date: 'ASC' } });
  }

  findClassrooms(): Promise<Classroom[]> {
    return this.classrooms.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Workshop> {
    const workshop = await this.workshops.findOne({ where: { id }, relations: { classroom: true } });
    if (!workshop) throw new NotFoundException('Мастер-класс не найден.');
    return workshop;
  }

  async create(dto: CreateWorkshopDto): Promise<Workshop> {
    if (dto.date <= new Date()) throw new BadRequestException('Дата мастер-класса должна быть в будущем.');
    const classroom = await this.classrooms.findOneBy({ id: dto.classroomId });
    if (!classroom) throw new NotFoundException('Аудитория не найдена.');
    if (dto.maxParticipants > classroom.capacity) {
      throw new BadRequestException('Вместимость мастер-класса не может превышать вместимость аудитории.');
    }
    return this.workshops.save(this.workshops.create({
      title: dto.title,
      description: dto.description,
      date: dto.date,
      maxParticipants: dto.maxParticipants,
      classroom,
    }));
  }

  async update(id: number, dto: UpdateWorkshopDto): Promise<Workshop> {
    const workshop = await this.findOne(id);
    if (dto.date && dto.date <= new Date()) {
      throw new BadRequestException('Дата мастер-класса должна быть в будущем.');
    }

    let classroom = workshop.classroom;
    if (dto.classroomId !== undefined) {
      const foundClassroom = await this.classrooms.findOneBy({ id: dto.classroomId });
      if (!foundClassroom) throw new NotFoundException('Аудитория не найдена.');
      classroom = foundClassroom;
    }

    const maxParticipants = dto.maxParticipants ?? workshop.maxParticipants;
    if (maxParticipants > classroom.capacity) {
      throw new BadRequestException('Вместимость мастер-класса превышает вместимость аудитории.');
    }

    workshop.title = dto.title ?? workshop.title;
    workshop.description = dto.description ?? workshop.description;
    workshop.date = dto.date ?? workshop.date;
    workshop.maxParticipants = maxParticipants;
    workshop.classroom = classroom;

    return this.workshops.save(workshop);
  }

  async remove(id: number): Promise<void> {
    const workshop = await this.findOne(id);
    await this.workshops.remove(workshop);
  }

  createClassroom(dto: CreateClassroomDto): Promise<Classroom> {
    return this.classrooms.save(this.classrooms.create(dto));
  }
}
