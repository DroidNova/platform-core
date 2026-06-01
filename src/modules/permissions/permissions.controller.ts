import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get permissions module status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permissions module status response',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: { module: 'permissions', status: 'ok' },
      },
    },
  })
  getStatus() {
    return this.permissionsService.getStatus();
  }
}
