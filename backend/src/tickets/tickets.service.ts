import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { PrismaService } from 'src/prisma.service';
import { ManageTicketDto } from './dto/manage-ticket.dto';
import { RoleName } from 'generated/prisma/enums';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  create(createTicketDto: CreateTicketDto, userId: number) {
    return this.prisma.ticket.create({
      data: { ...createTicketDto, creatorId: userId },
    });
  }

  findAll(id, role) {
    if (role === 'EMPLOYEE') {
      return this.prisma.ticket.findMany({ where: { creatorId: id } });
    }
    return this.prisma.ticket.findMany();
  }

  async findOne(id: number, userId, role: RoleName) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    if (role === 'EMPLOYEE') {
      if (ticket.creatorId !== userId)
        throw new ForbiddenException('Access denied');
    }
    return ticket;
  }

  async update(id: number, updateTicketDto: UpdateTicketDto, userId) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    if (ticket.creatorId === userId) {
      return this.prisma.ticket.update({
        where: { id },
        data: { ...updateTicketDto },
      });
    }
    console.log(ticket.creatorId, userId);
    throw new ForbiddenException('Access denied');
  }

  manage(id: number, manageTicketDto: ManageTicketDto) {
    return this.prisma.ticket.update({
      where: { id },
      data: { ...manageTicketDto },
    });
  }

  remove(id: number) {
    return this.prisma.ticket.delete({ where: { id } });
  }
}
