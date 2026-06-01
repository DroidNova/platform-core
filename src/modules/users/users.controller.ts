import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get users module status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users module status response',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: { module: 'users', status: 'ok' },
      },
    },
  })
  getStatus() {
    return this.usersService.getStatus();
  }
}
