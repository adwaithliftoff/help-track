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
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ManageTicketDto } from './dto/manage-ticket.dto';
import { ClaimsGuard } from 'src/auth/guards/claims.guard';
import { RequirePermissions } from 'src/auth/claims.decorator';

@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() createTicketDto: CreateTicketDto, @Req() req) {
    return this.ticketsService.create(createTicketDto, req.user.sub);
  }

  @Get()
  findAll(@Req() req) {
    return this.ticketsService.findAll(req.user.sub, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.ticketsService.findOne(+id, req.user.sub, req.user.role);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Req() req,
  ) {
    return this.ticketsService.update(+id, updateTicketDto, req.user.sub);
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
}
