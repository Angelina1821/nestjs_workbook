import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Workshop } from '../workshops/entities/workshop.entity';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking) private readonly bookings: Repository<Booking>,
    private readonly dataSource: DataSource,
  ) {}

  async create(user: User, dto: CreateBookingDto): Promise<Booking> {
    return this.dataSource.transaction(async (manager) => {
      const workshop = await manager.findOne(Workshop, {
        where: { id: dto.workshopId },
        relations: { classroom: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!workshop) throw new NotFoundException('Мастер-класс не найден.');
      if (workshop.date <= new Date()) throw new BadRequestException('Нельзя записаться на прошедший мастер-класс.');

      const existing = await manager.findOne(Booking, {
        where: { user: { id: user.id }, workshop: { id: workshop.id }, status: BookingStatus.ACTIVE },
      });
      if (existing) throw new ConflictException('Вы уже записаны на этот мастер-класс.');

      const count = await manager.count(Booking, {
        where: { workshop: { id: workshop.id }, status: BookingStatus.ACTIVE },
      });
      if (count >= workshop.maxParticipants) throw new BadRequestException('Свободных мест больше нет.');

      return manager.save(Booking, manager.create(Booking, { user, workshop, status: BookingStatus.ACTIVE }));
    });
  }

  findMine(user: User): Promise<Booking[]> {
    return this.bookings.find({
      where: { user: { id: user.id } },
      relations: { workshop: { classroom: true } },
      order: { createdAt: 'DESC' },
    });
  }

  findAll(): Promise<Booking[]> {
    return this.bookings.find({
      relations: { user: true, workshop: { classroom: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async cancel(user: User, id: number): Promise<Booking> {
    const booking = await this.bookings.findOne({
      where: { id, user: { id: user.id } },
      relations: { user: true, workshop: { classroom: true } },
    });
    if (!booking) throw new NotFoundException('Бронирование не найдено.');
    if (booking.status === BookingStatus.CANCELLED) throw new ConflictException('Бронирование уже отменено.');
    booking.status = BookingStatus.CANCELLED;
    return this.bookings.save(booking);
  }
}
