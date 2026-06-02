import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/jwt-payload.type';
import { AdminService } from './admin.service';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { ListAdminUsersDto } from './dto/list-admin-users.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

type AuthenticatedRequest = {
  user: AuthenticatedUser;
};

const standardErrorSchema = {
  example: {
    success: false,
    statusCode: 403,
    message: 'Forbidden resource',
    timestamp: '2026-04-01T00:00:00.000Z',
    path: '/api/v1/admin/users',
  },
};

@ApiTags('Admin')
@ApiBearerAuth('bearer')
@ApiExtraModels(SuccessResponseDto, PaginatedResponseDto)
@Controller('admin/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @Permissions('users.read')
  @ApiOperation({ summary: 'Get users with pagination and optional search' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'alex' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users retrieved successfully',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponseDto' },
        { properties: { data: { $ref: '#/components/schemas/PaginatedResponseDto' } } },
      ],
    },
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, schema: standardErrorSchema })
  listUsers(@Query() query: ListAdminUsersDto) {
    return this.adminService.listUsers(query);
  }

  @Get(':id')
  @Permissions('users.read')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id', example: 'usr_01HXYZ123' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User retrieved successfully',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponseDto' },
        {
          properties: {
            data: {
              type: 'object',
              example: {
                id: 'usr_01HXYZ123',
                fullName: 'Alex Johnson',
                status: 'ACTIVE',
              },
            },
          },
        },
      ],
    },
  })
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch(':id/status')
  @Permissions('users.update')
  @ApiOperation({ summary: 'Update user status' })
  @ApiParam({ name: 'id', example: 'usr_01HXYZ123' })
  @ApiBody({ type: UpdateUserStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User status updated successfully',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponseDto' },
        {
          properties: {
            data: {
              type: 'object',
              example: { id: 'usr_01HXYZ123', status: 'SUSPENDED' },
            },
          },
        },
      ],
    },
  })
  updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adminService.updateUserStatus(id, dto, request.user);
  }

  @Post(':id/roles')
  @Permissions('roles.assign')
  @ApiOperation({ summary: 'Assign roles to a user' })
  @ApiParam({ name: 'id', example: 'usr_01HXYZ123' })
  @ApiBody({ type: AssignUserRolesDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Roles assigned successfully',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponseDto' },
        {
          properties: {
            data: {
              type: 'object',
              example: {
                id: 'usr_01HXYZ123',
                roles: ['ADMIN', 'SUPPORT_AGENT'],
              },
            },
          },
        },
      ],
    },
  })
  assignRoles(
    @Param('id') id: string,
    @Body() dto: AssignUserRolesDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adminService.assignRoles(id, dto, request.user);
  }
}
