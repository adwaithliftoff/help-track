import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Ticket,
  TicketCategory,
  TicketComment,
  TicketCommentDocument,
  TicketDocument,
  TicketPriority,
  TicketStatus,
} from 'src/mongoose.schemas';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ManageTicketDto } from './dto/manage-ticket.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { resolve } from 'path';
import { createReadStream, existsSync } from 'fs';
import { lookup } from 'mime-types';

@Injectable()
export class ticketsMongooseService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    @InjectModel(TicketComment.name)
    private ticketCommentModel: Model<TicketCommentDocument>,
  ) {}

  private ticketPopulate = [
    { path: 'creator', select: 'fullName' },
    { path: 'assignee', select: 'fullName' },
    { path: 'linkedEmployee', select: 'fullName' },
    { path: 'linkedAsset', select: 'assetName' },
  ];

  async create(createTicketDto: CreateTicketDto, files, user) {
    const attachments = files.map((file) => file.filename);
    const ticket = await this.ticketModel.create({
      ...createTicketDto,
      attachments,
      creatorId: new Types.ObjectId(String(user._id)),
      linkedAssetId: new Types.ObjectId(createTicketDto.linkedAssetId),
    } as any);
    return ticket;
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
    user,
  ) {
    const where = {
      ...(query.status && { status: query.status as TicketStatus }),
      ...(query.priority && { priority: query.priority as TicketPriority }),
      ...(query.category && { category: query.category as TicketCategory }),
      ...(query.assigneeId && { assigneeId: query.assigneeId }),
      ...(query.assetId && { linkedAssetId: query.assetId }),
      ...(query.employeeId && { linkedEmployeeId: query.employeeId }),
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
      const tickets = await this.ticketModel.find({ ...where });
      return tickets.map((e) => ({ ...e.toObject(), id: e._id.toString() }));
    }
    const tickets = await this.ticketModel.find({
      where: {
        creatorId: new Types.ObjectId(String(user.id)),
        ...where,
      },
    });
    return tickets.map((e) => ({ ...e.toObject(), id: e._id.toString() }));
  }

  async findOne(id: string, user) {
    const ticket = await this.ticketModel
      .findById(id)
      .populate(this.ticketPopulate);
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    if (user.role === 'EMPLOYEE') {
      if (ticket.creatorId !== user.id)
        throw new ForbiddenException('Access denied');
    }
    return { ...ticket.toObject(), id: ticket._id.toString() };
  }

  async update(id: string, updateTicketDto: UpdateTicketDto, files, user) {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    const newAttachments = files.map((file) => file.filename);
    const attachments =
      newAttachments.length > 0
        ? [...ticket.attachments, ...newAttachments]
        : ticket.attachments;
    if (String(ticket.creatorId) === String(user._id)) {
      return this.ticketModel
        .findByIdAndUpdate(
          id,
          { ...updateTicketDto, attachments },
          { new: true },
        )
        .populate(this.ticketPopulate);
    }
    throw new ForbiddenException('Access denied');
  }

  async manage(id: number, manageTicketDto: ManageTicketDto) {
    return this.ticketModel
      .findByIdAndUpdate(id, { ...manageTicketDto }, { new: true })
      .populate(this.ticketPopulate);
  }

  remove(id: string) {
    return this.ticketModel.findByIdAndDelete(id);
  }

  async addComment(ticketId: string, createCommentDto: CreateCommentDto, user) {
    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (user.role === 'EMPLOYEE' && ticket.creatorId !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    return this.ticketCommentModel.create({
      ...createCommentDto,
      ticketId,
      updaterId: new Types.ObjectId(String(user._id)),
    });
  }

  async getComments(id: string, user) {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (user.role === 'EMPLOYEE' && ticket.creatorId !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    return this.ticketCommentModel.find({ ticketId: id }).populate('updater');
  }

  async getAttachment(ticketId: string, user, filename: string) {
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
