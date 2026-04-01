import { Injectable } from '@nestjs/common';

@Injectable()
export class PermissionsService {
  getStatus() {
    return {
      success: true,
      message: 'Permissions module is ready',
    };
  }
}
