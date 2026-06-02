import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get settings module status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Settings module status response',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: { module: 'settings', status: 'ok' },
      },
    },
  })
  getStatus() {
    return this.settingsService.getStatus();
  }
}
