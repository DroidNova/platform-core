import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@platformcore.dev',
    description: 'Email or phone used to authenticate',
  })
  @IsString()
  emailOrPhone!: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  password!: string;

  @ApiPropertyOptional({
    example: 'Chrome on macOS',
    description: 'Optional label to identify the current device',
  })
  @IsOptional()
  @IsString()
  deviceName?: string;
}
