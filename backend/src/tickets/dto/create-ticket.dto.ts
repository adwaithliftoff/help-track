import { IsArray, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { TicketCategory, TicketPriority } from 'generated/prisma/enums';

export class CreateTicketDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(TicketCategory)
  category: TicketCategory;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @IsOptional()
  @IsInt()
  linkedAssetId?: number;

  @IsOptional()
  @IsArray()
  attachments?: string[];
}
