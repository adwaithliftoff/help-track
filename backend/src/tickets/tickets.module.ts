import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { PrismaService } from 'src/prisma.service';
import { EmployeesModule } from 'src/employees/employees.module';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { ConfigService } from '@nestjs/config';
import {
  Ticket,
  TicketComment,
  TicketCommentDocument,
  TicketCommentSchema,
  TicketDocument,
  TicketSchema,
} from 'src/mongoose.schemas';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ticketsMongooseService } from './tickets.mongoose.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
      { name: TicketComment.name, schema: TicketCommentSchema },
    ]),
    EmployeesModule,
    PermissionsModule,
  ],
  controllers: [TicketsController],
  providers: [
    {
      provide: 'TICKET_SERVICE',
      inject: [
        ConfigService,
        PrismaService,
        getModelToken(Ticket.name),
        getModelToken(TicketComment.name),
      ],
      useFactory: (
        config: ConfigService,
        prisma: PrismaService,
        ticketModel: Model<TicketDocument>,
        ticketCommentModel: Model<TicketCommentDocument>,
      ) => {
        return config.get<string>('DB') === 'mongo'
          ? new ticketsMongooseService(ticketModel, ticketCommentModel)
          : new TicketsService(prisma);
      },
    },
    PrismaService,
  ],
})
export class TicketsModule {}
