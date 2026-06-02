import { Module } from '@nestjs/common';
import { AdminModule } from './modules/platform-core/admin/admin.module';
import { AuthModule } from './modules/platform-core/auth/auth.module';
import { HealthModule } from './modules/platform-core/health/health.module';
import { PermissionsModule } from './modules/platform-core/permissions/permissions.module';
import { RolesModule } from './modules/platform-core/roles/roles.module';
import { SessionsModule } from './modules/platform-core/sessions/sessions.module';
import { SettingsModule } from './modules/platform-core/settings/settings.module';
import { UsersModule } from './modules/platform-core/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AdminModule,
    AuthModule,
    HealthModule,
    PermissionsModule,
    RolesModule,
    SessionsModule,
    SettingsModule,
    UsersModule,
  ],
})
export class AppModule {}
