import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get service health status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service health response',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: { status: 'ok' },
      },
    },
  })
  getHealth() {
    return this.healthService.getHealth();
  }
}
