import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum AdminUserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class UpdateUserStatusDto {
  @ApiProperty({ enum: AdminUserStatus, example: AdminUserStatus.ACTIVE })
  @IsEnum(AdminUserStatus)
  status!: AdminUserStatus;
}
