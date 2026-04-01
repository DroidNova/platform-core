import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  getStatus() {
    return {
      success: true,
      message: 'Auth module is ready',
    };
  }
}
