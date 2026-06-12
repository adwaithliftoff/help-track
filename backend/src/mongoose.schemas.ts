import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXITED = 'EXITED',
}
export enum RoleName {
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}
export enum AssetStatus {
  INVENTORY = 'INVENTORY',
  ALLOCATED = 'ALLOCATED',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  RETURNED = 'RETURNED',
  INACTIVE = 'INACTIVE',
  LOST = 'LOST',
  RETIRED = 'RETIRED',
}
export enum AssetCategory {
  HARDWARE = 'HARDWARE',
  ACCESSORY = 'ACCESSORY',
  SOFTWARE = 'SOFTWARE',
  AI_SUBSCRIPTION = 'AI_SUBSCRIPTION',
  SAAS_TOOL = 'SAAS_TOOL',
  OTHER = 'OTHER',
}
export enum ReturnCondition {
  NEW = 'NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  DAMAGED = 'DAMAGED',
}
export enum TicketCategory {
  HARDWARE_ISSUE = 'HARDWARE_ISSUE',
  SOFTWARE_ISSUE = 'SOFTWARE_ISSUE',
  ACCESS_ISSUE = 'ACCESS_ISSUE',
  ASSET_REQUEST = 'ASSET_REQUEST',
  SUBSCRIPTION_ISSUE = 'SUBSCRIPTION_ISSUE',
  GENERAL_SUPPORT = 'GENERAL_SUPPORT',
}
export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}
export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_FOR_USER = 'WAITING_FOR_USER',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED',
}
export enum Permission {
  EMPLOYEE_CREATE = 'EMPLOYEE_CREATE',
  EMPLOYEE_READ = 'EMPLOYEE_READ',
  EMPLOYEE_UPDATE = 'EMPLOYEE_UPDATE',
  EMPLOYEE_DELETE = 'EMPLOYEE_DELETE',
  ASSET_CREATE = 'ASSET_CREATE',
  ASSET_READ = 'ASSET_READ',
  ASSET_UPDATE = 'ASSET_UPDATE',
  ASSET_DELETE = 'ASSET_DELETE',
  ALLOCATION_CREATE = 'ALLOCATION_CREATE',
  ALLOCATION_READ = 'ALLOCATION_READ',
  ALLOCATION_UPDATE = 'ALLOCATION_UPDATE',
  TICKET_READ = 'TICKET_READ',
  TICKET_MANAGE = 'TICKET_MANAGE',
  TICKET_DELETE = 'TICKET_DELETE',
}

// ─── Department ───────────────────────────────────────────────────────────────

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true })
export class Department {
  @Prop({ required: true, unique: true })
  name: string;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);

// ─── Employee ─────────────────────────────────────────────────────────────────

export type EmployeeDocument = Employee & Document;

@Schema({ timestamps: true })
export class Employee {
  @Prop({ unique: true, sparse: true })
  clerkUserId: string;

  @Prop({ unique: true, sparse: true })
  employeeNumber: number;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  officialEmail: string;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId: Types.ObjectId;

  @Prop()
  designation: string;

  @Prop()
  joiningDate: Date;

  @Prop({ enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
  status: EmployeeStatus;

  @Prop({ enum: RoleName, default: RoleName.EMPLOYEE })
  role: RoleName;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

// ─── PhysicalAsset (embedded in Asset) ───────────────────────────────────────

@Schema({ _id: false })
export class PhysicalAsset {
  @Prop({ unique: true, sparse: true })
  serialNumber: string;

  @Prop({ unique: true, sparse: true })
  macAddress: string;

  @Prop({ unique: true, sparse: true })
  assetTag: string;
}

export const PhysicalAssetSchema = SchemaFactory.createForClass(PhysicalAsset);

// ─── DigitalSubscription (embedded in Asset) ──────────────────────────────────

@Schema({ _id: false })
export class DigitalSubscription {
  @Prop()
  planLicenseType: string;

  @Prop()
  totalSeats: number;

  @Prop()
  renewalDate: Date;

  @Prop()
  accountOwner: string;

  @Prop()
  licenseKey: string;
}

export const DigitalSubscriptionSchema =
  SchemaFactory.createForClass(DigitalSubscription);

// ─── Asset ────────────────────────────────────────────────────────────────────

export type AssetDocument = Asset & Document;

@Schema({ timestamps: true })
export class Asset {
  @Prop({ enum: AssetCategory, required: true })
  assetCategory: AssetCategory;

  @Prop({ required: true })
  assetType: string;

  @Prop({ required: true })
  assetName: string;

  @Prop()
  brandVendor: string;

  @Prop()
  modelPlan: string;

  @Prop()
  purchaseDate: Date;

  @Prop({ enum: AssetStatus, default: AssetStatus.INVENTORY })
  status: AssetStatus;

  // PhysicalAsset and DigitalSubscription are embedded
  // since they have a strict 1-to-1 relationship with Asset
  @Prop({ type: PhysicalAssetSchema })
  physicalAsset: PhysicalAsset;

  @Prop({ type: DigitalSubscriptionSchema })
  digitalSubscription: DigitalSubscription;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);

// ─── AllocationHistory ────────────────────────────────────────────────────────

export type AllocationHistoryDocument = AllocationHistory & Document;

@Schema({ timestamps: true })
export class AllocationHistory {
  @Prop({ type: Types.ObjectId, ref: 'Asset', required: true })
  assetId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  assignedEmployeeId: Types.ObjectId;

  @Prop({ required: true })
  allocationDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  allocatedById: Types.ObjectId;

  @Prop()
  returnDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  receivingAdminId: Types.ObjectId;

  @Prop({ enum: ReturnCondition })
  returnCondition: ReturnCondition;

  @Prop()
  remarks: string;
}

export const AllocationHistorySchema =
  SchemaFactory.createForClass(AllocationHistory);

// ─── RolePermission ───────────────────────────────────────────────────────────

export type RolePermissionDocument = RolePermission & Document;

@Schema()
export class RolePermission {
  @Prop({ enum: RoleName, required: true })
  role: RoleName;

  @Prop({ enum: Permission, required: true })
  permission: Permission;
}

export const RolePermissionSchema =
  SchemaFactory.createForClass(RolePermission);
RolePermissionSchema.index({ role: 1, permission: 1 }, { unique: true });

// ─── TicketComment ────────────────────────────────────────────────────────────

export type TicketCommentDocument = TicketComment & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class TicketComment {
  @Prop({ type: Types.ObjectId, ref: 'Ticket', required: true })
  ticketId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  updaterId: Types.ObjectId;

  @Prop({ required: true })
  comment: string;
}

export const TicketCommentSchema = SchemaFactory.createForClass(TicketComment);

// ─── Ticket ───────────────────────────────────────────────────────────────────

export type TicketDocument = Ticket & Document;

@Schema({ timestamps: true })
export class Ticket {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ enum: TicketCategory, required: true })
  category: TicketCategory;

  @Prop({ enum: TicketPriority, default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Prop({ enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  creatorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  assigneeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  linkedEmployeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Asset' })
  linkedAssetId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop()
  resolutionNote: string;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
