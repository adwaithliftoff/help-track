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
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  private ticketInclude = {
    creator: { select: { fullName: true } },
    assignee: { select: { fullName: true } },
    linkedEmployee: { select: { fullName: true } },
    linkedAsset: { select: { assetName: true } },
  } as const;

  create(createTicketDto: CreateTicketDto, userId: number) {
    return this.prisma.ticket.create({
      data: { ...createTicketDto, creatorId: userId },
    });
  }

  findAll(id: number, role: RoleName) {
    if (role === 'EMPLOYEE') {
      return this.prisma.ticket.findMany({ where: { creatorId: id } });
    }
    return this.prisma.ticket.findMany();
  }

  async findOne(id: number, userId, role: RoleName) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: this.ticketInclude,
    });
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    if (role === 'EMPLOYEE') {
      if (ticket.creatorId !== userId)
        throw new ForbiddenException('Access denied');
    }
    return ticket;
  }

  async update(id: number, updateTicketDto: UpdateTicketDto, userId: number) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    if (ticket.creatorId === userId) {
      return this.prisma.ticket.update({
        where: { id },
        data: { ...updateTicketDto },
        include: this.ticketInclude,
      });
    }
    console.log(ticket.creatorId, userId);
    throw new ForbiddenException('Access denied');
  }

  manage(id: number, manageTicketDto: ManageTicketDto) {
    return this.prisma.ticket.update({
      where: { id },
      data: { ...manageTicketDto },
      include: this.ticketInclude,
    });
  }

  remove(id: number) {
    return this.prisma.ticket.delete({ where: { id } });
  }

  async addComment(
    ticketId: number,
    createCommentDto: CreateCommentDto,
    updaterId: number,
    role: string,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (role === 'EMPLOYEE' && ticket.creatorId !== updaterId) {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.ticketComment.create({
      data: {
        ...createCommentDto,
        ticketId,
        updaterId,
      },
    });
  }

  async getComments(id: number, updaterId: number, role: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (role === 'EMPLOYEE' && ticket.creatorId !== updaterId) {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.ticketComment.findMany({
      where: { ticketId: id },
    });
  }
}
