import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingsService } from './bookings.service';

interface AuthenticatedRequest extends Request {
  user: User;
}

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly service: BookingsService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateBookingDto) {
    return this.service.create(req.user, dto);
  }

  @Post('create')
  createLegacy(@Req() req: AuthenticatedRequest, @Body() dto: CreateBookingDto) {
    return this.service.create(req.user, dto);
  }

  @Get()
  findMine(@Req() req: AuthenticatedRequest) {
    return this.service.findMine(req.user);
  }

  @Get('mine')
  findMineAlias(@Req() req: AuthenticatedRequest) {
    return this.service.findMine(req.user);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.service.findAll();
  }

  @Delete(':id')
  cancel(@Req() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.service.cancel(req.user, id);
  }
}
