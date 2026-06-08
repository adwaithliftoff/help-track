import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { PrismaService } from 'src/prisma.service';
import { ManageTicketDto } from './dto/manage-ticket.dto';
import {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from 'generated/prisma/enums';
import { CreateCommentDto } from './dto/create-comment.dto';
import { createReadStream, existsSync } from 'fs';
import { lookup } from 'mime-types';
import { resolve } from 'path';
import { Employee } from 'generated/prisma/client';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  private ticketInclude = {
    creator: { select: { fullName: true } },
    assignee: { select: { fullName: true } },
    linkedEmployee: { select: { fullName: true } },
    linkedAsset: { select: { assetName: true } },
  } as const;

  async create(createTicketDto: CreateTicketDto, files, userId: number) {
    const attachments = files.map((file) => file.filename);
    return this.prisma.ticket.create({
      data: { ...createTicketDto, attachments, creatorId: userId },
    });
  }

  async findAll(
    query: {
      status?: string;
      priority?: string;
      category?: string;
      assigneeId?: string;
      employeeId?: string;
      assetId?: string;
      dateFrom?: string;
      dateTo?: string;
    },
    user: Employee,
  ) {
    const where = {
      ...(query.status && { status: query.status as TicketStatus }),
      ...(query.priority && { priority: query.priority as TicketPriority }),
      ...(query.category && { category: query.category as TicketCategory }),
      ...(query.assigneeId && { assigneeId: Number(query.assigneeId) }),
      ...(query.assetId && { linkedAssetId: Number(query.assetId) }),
      ...(query.employeeId && { linkedEmployeeId: Number(query.employeeId) }),
      ...(query.dateFrom || query.dateTo
        ? {
            createdAt: {
              ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
              ...(query.dateTo && { lte: new Date(query.dateTo) }),
            },
          }
        : {}),
    };
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return this.prisma.ticket.findMany({ where: { ...where } });
    }
    return this.prisma.ticket.findMany({
      where: {
        creatorId: user.id,
        ...where,
      },
    });
  }

  async findOne(id: number, user: Employee) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: this.ticketInclude,
    });
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    if (user.role === 'EMPLOYEE') {
      if (ticket.creatorId !== user.id)
        throw new ForbiddenException('Access denied');
    }
    return ticket;
  }

  async update(
    id: number,
    updateTicketDto: UpdateTicketDto,
    files,
    userId: number,
  ) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    const newAttachments = files.map((file) => file.filename);
    const attachments =
      newAttachments.length > 0
        ? [...ticket.attachments, ...newAttachments]
        : ticket.attachments;
    if (ticket.creatorId === userId) {
      return this.prisma.ticket.update({
        where: { id },
        data: { ...updateTicketDto, attachments },
        include: this.ticketInclude,
      });
    }
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
    user: Employee,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (user.role === 'EMPLOYEE' && ticket.creatorId !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.ticketComment.create({
      data: {
        ...createCommentDto,
        ticketId,
        updaterId: user.id,
      },
    });
  }

  async getComments(id: number, user: Employee) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (user.role === 'EMPLOYEE' && ticket.creatorId !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.ticketComment.findMany({
      where: { ticketId: id },
      include: { updater: { select: { fullName: true } } },
    });
  }

  async getAttachment(ticketId: number, user: Employee, filename: string) {
    const ticket = await this.findOne(ticketId, user);
    if (!ticket.attachments.includes(filename)) {
      throw new NotFoundException('Attachment not found');
    }
    const uploadsDir = resolve(process.cwd(), 'uploads', 'tickets');
    const filePath = resolve(uploadsDir, filename);
    if (!filePath.startsWith(uploadsDir))
      throw new ForbiddenException('Access denied');
    if (!existsSync(filePath)) throw new NotFoundException('File not found');

    return new StreamableFile(createReadStream(filePath), {
      type: lookup(filename) || 'application/octet-stream',
      disposition: `inline; filename="${filename}"`,
    });
  }
}
