import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionsService {
  getStatus() {
    return {
      success: true,
      message: 'Sessions module is ready',
    };
  }
}
