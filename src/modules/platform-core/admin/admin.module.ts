import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { PrismaModule } from '../../../prisma/prisma.module';
import { RolesModule } from '../roles/roles.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [PrismaModule, RolesModule],
  controllers: [AdminController],
  providers: [AdminService, PermissionsGuard],
  exports: [AdminService],
})
export class AdminModule {}
