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

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  private ticketInclude = {
    creator: { select: { fullName: true } },
    assignee: { select: { fullName: true } },
    linkedEmployee: { select: { fullName: true } },
    linkedAsset: { select: { assetName: true } },
  } as const;

  async create(createTicketDto: CreateTicketDto, files, userId: string) {
    const attachments = files.map((file) => file.filename);
    const employee = await this.prisma.employee.findUnique({
      where: { clerkUserId: userId },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return this.prisma.ticket.create({
      data: { ...createTicketDto, attachments, creatorId: employee.id },
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
    id: string,
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
    const employee = await this.prisma.employee.findUnique({
      where: { clerkUserId: id },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    if (employee.role !== 'ADMIN') {
      return this.prisma.ticket.findMany({
        where: {
          creatorId: employee.id,
          ...where,
        },
      });
    }
    return this.prisma.ticket.findMany({ where: { ...where } });
  }

  async findOne(id: number, userId) {
    const employee = await this.prisma.employee.findUnique({
      where: { clerkUserId: userId },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: this.ticketInclude,
    });
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    if (employee.role === 'EMPLOYEE') {
      if (ticket.creatorId !== employee.id)
        throw new ForbiddenException('Access denied');
    }
    return ticket;
  }

  async update(
    id: number,
    updateTicketDto: UpdateTicketDto,
    files,
    userId: string,
  ) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    const employee = await this.prisma.employee.findUnique({
      where: { clerkUserId: userId },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    const newAttachments = files.map((file) => file.filename);
    const attachments =
      newAttachments.length > 0
        ? [...ticket.attachments, ...newAttachments]
        : ticket.attachments;
    if (ticket.creatorId === employee.id) {
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
    updaterId: string,
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: { clerkUserId: updaterId },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (employee.role === 'EMPLOYEE' && ticket.creatorId !== employee?.id) {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.ticketComment.create({
      data: {
        ...createCommentDto,
        ticketId,
        updaterId: employee.id,
      },
    });
  }

  async getComments(id: number, updaterId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { clerkUserId: updaterId },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (employee.role === 'EMPLOYEE' && ticket.creatorId !== employee.id) {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.ticketComment.findMany({
      where: { ticketId: id },
      include: { updater: { select: { fullName: true } } },
    });
  }

  async getAttachment(ticketId: number, userId: number, filename: string) {
    const ticket = await this.findOne(ticketId, userId);
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
