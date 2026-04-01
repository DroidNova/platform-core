import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@platformcore.dev',
    description: 'Email or phone used to authenticate',
  })
  @IsString()
  @MinLength(3)
  emailOrPhone!: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({
    example: 'Chrome on macOS',
    description: 'Optional label to identify the current device',
  })
  @IsOptional()
  @IsString()
  deviceName?: string;
}
