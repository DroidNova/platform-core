import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.token',
    description: 'Valid refresh token from a previous authentication response',
  })
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}
