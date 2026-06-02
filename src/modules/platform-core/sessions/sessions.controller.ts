import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get sessions module status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sessions module status response',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: { module: 'sessions', status: 'ok' },
      },
    },
  })
  getStatus() {
    return this.sessionsService.getStatus();
  }
}
