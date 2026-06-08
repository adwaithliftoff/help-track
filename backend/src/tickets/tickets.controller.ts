import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';
import { ManageTicketDto } from './dto/manage-ticket.dto';
import { ClaimsGuard } from 'src/auth/guards/claims.guard';
import { RequirePermissions } from 'src/auth/claims.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { FileValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { randomUUID } from 'node:crypto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { Employee } from 'generated/prisma/browser';

@UseGuards(ClerkAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('attachments', 5, {
      storage: diskStorage({
        destination: './uploads/tickets',
        filename: (req, file, callback) => {
          callback(
            null,
            `${Date.now()}-${randomUUID()}${extname(file.originalname)}`,
          );
        },
      }),
    }),
  )
  create(
    @Body() createTicketDto: CreateTicketDto,
    @UploadedFiles(new FileValidationPipe()) files: Express.Multer.File[],
    @CurrentUser() user: Employee,
  ) {
    return this.ticketsService.create(createTicketDto, files, user.id);
  }

  @Get()
  findAll(
    @Query()
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
    @CurrentUser() user: Employee,
  ) {
    return this.ticketsService.findAll(query, user);
  }

  @Get(':ticketId/attachments/:filename')
  async getAttachment(
    @Param('ticketId') ticketId: number,
    @Param('filename') filename: string,
    @CurrentUser() user: Employee,
  ) {
    return this.ticketsService.getAttachment(ticketId, user, filename);
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string, @CurrentUser() user: Employee) {
    return this.ticketsService.getComments(+id, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: Employee) {
    return this.ticketsService.findOne(+id, user);
  }

  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('attachments', 5, {
      storage: diskStorage({
        destination: './uploads/tickets',
        filename: (req, file, callback) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(
            null,
            `${Date.now()}-${randomUUID()}${extname(file.originalname)}`,
          );
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @UploadedFiles(new FileValidationPipe()) files: Express.Multer.File[],
    @CurrentUser() user: Employee,
  ) {
    return this.ticketsService.update(+id, updateTicketDto, files, user.id);
  }

  @UseGuards(ClaimsGuard)
  @RequirePermissions('TICKET_MANAGE')
  @Patch(':id/manage')
  manage(@Param('id') id: string, @Body() manageTicketDto: ManageTicketDto) {
    return this.ticketsService.manage(+id, manageTicketDto);
  }

  @UseGuards(ClaimsGuard)
  @RequirePermissions('TICKET_DELETE')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(+id);
  }

  @Post(':id/comments')
  postComment(
    @Body() createCommentDto: CreateCommentDto,
    @Param('id') id: string,
    @CurrentUser() user: Employee,
  ) {
    return this.ticketsService.addComment(+id, createCommentDto, user);
  }
}
