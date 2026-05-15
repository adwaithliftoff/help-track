import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
  StreamableFile,
  ForbiddenException,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ManageTicketDto } from './dto/manage-ticket.dto';
import { ClaimsGuard } from 'src/auth/guards/claims.guard';
import { RequirePermissions } from 'src/auth/claims.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { resolve } from 'node:path';
import { createReadStream, existsSync } from 'node:fs';
import { lookup } from 'mime-types';

@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('attachments', 5, {
      storage: diskStorage({
        destination: './uploads/tickets',
        filename: (req, file, callback) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(null, `${unique}-${file.originalname}`);
        },
      }),
    }),
  )
  create(
    @Body() createTicketDto: CreateTicketDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
  ) {
    return this.ticketsService.create(createTicketDto, files, req.user.sub);
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
    @Req() req,
  ) {
    return this.ticketsService.findAll(query, req.user.sub, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.ticketsService.findOne(+id, req.user.sub, req.user.role);
  }

  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('attachments', 5, {
      storage: diskStorage({
        destination: './uploads/tickets',
        filename: (req, file, callback) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(null, `${unique}-${file.originalname}`);
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
  ) {
    return this.ticketsService.update(
      +id,
      updateTicketDto,
      files,
      req.user.sub,
    );
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
    @Req() req,
  ) {
    return this.ticketsService.addComment(
      +id,
      createCommentDto,
      req.user.sub,
      req.user.role,
    );
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string, @Req() req) {
    return this.ticketsService.getComments(+id, req.user.sub, req.user.role);
  }

  @Get('attachments/:filename')
  serveAttachment(@Param('filename') filename: string) {
    const uploadsDir = resolve(process.cwd(), 'uploads', 'tickets');
    const filePath = resolve(uploadsDir, filename);

    if (!filePath.startsWith(uploadsDir))
      throw new ForbiddenException('Access denied');

    if (!existsSync(filePath)) throw new ForbiddenException('File not found');

    return new StreamableFile(createReadStream(filePath), {
      type: lookup(filename) || 'application/octet-stream',
      disposition: `inline; filename="${filename}"`,
    });
  }
}
