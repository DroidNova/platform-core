import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { ListAdminUsersDto } from './dto/list-admin-users.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @Permissions('users.read')
  listUsers(@Query() query: ListAdminUsersDto) {
    return this.adminService.listUsers(query);
  }

  @Get(':id')
  @Permissions('users.read')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch(':id/status')
  @Permissions('users.update')
  updateUserStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.adminService.updateUserStatus(id, dto);
  }

  @Post(':id/roles')
  @Permissions('roles.assign')
  assignRoles(@Param('id') id: string, @Body() dto: AssignUserRolesDto) {
    return this.adminService.assignRoles(id, dto);
  }
}
