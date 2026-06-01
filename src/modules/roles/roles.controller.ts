import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get roles module status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Roles module status response',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: { module: 'roles', status: 'ok' },
      },
    },
  })
  getStatus() {
    return this.rolesService.getStatus();
  }
}
