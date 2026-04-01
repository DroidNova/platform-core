import { Injectable } from '@nestjs/common';

@Injectable()
export class RolesService {
  getStatus() {
    return {
      success: true,
      message: 'Roles module is ready',
    };
  }
}
