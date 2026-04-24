import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from 'generated/prisma/enums';

export class ManageTicketDto {
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @IsInt()
  @IsOptional()
  assigneeId?: number;

  @IsInt()
  @IsOptional()
  linkedEmployeeId?: number;

  @IsString()
  @IsOptional()
  resolutionNote?: string;

  @IsEnum(TicketCategory)
  @IsOptional()
  category?: TicketCategory;
}
