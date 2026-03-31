import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getStatus() {
    return {
      success: true,
      message: 'Users module is ready',
    };
  }
}
