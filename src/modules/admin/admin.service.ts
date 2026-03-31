import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  getStatus() {
    return {
      success: true,
      message: 'Admin module is ready',
    };
  }
}
