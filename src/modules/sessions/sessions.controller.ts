import { Controller, Get } from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get('status')
  getStatus() {
    return this.sessionsService.getStatus();
  }
}
