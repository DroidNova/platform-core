import { IsEnum } from 'class-validator';

export enum AdminUserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class UpdateUserStatusDto {
  @IsEnum(AdminUserStatus)
  status!: AdminUserStatus;
}
