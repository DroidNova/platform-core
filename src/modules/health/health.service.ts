import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      success: true,
      message: 'Platform Core API is running',
    };
  }
}
