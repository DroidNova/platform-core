import { Injectable } from '@nestjs/common';

@Injectable()
export class SettingsService {
  getStatus() {
    return {
      success: true,
      message: 'Settings module is ready',
    };
  }
}
