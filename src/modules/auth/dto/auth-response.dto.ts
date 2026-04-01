import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({ example: 'usr_01HXYZ123' })
  id!: string;

  @ApiProperty({ example: 'Alex Johnson' })
  fullName!: string;

  @ApiProperty({ example: 'alex@platformcore.dev', nullable: true })
  email!: string | null;

  @ApiProperty({ example: '+14155550123', nullable: true })
  phone!: string | null;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty({ example: ['SUPER_ADMIN'] })
  roles!: string[];

  @ApiProperty({ example: ['users.read', 'users.update'] })
  permissions!: string[];
}

export class AuthTokensDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access.token' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.token' })
  refreshToken!: string;

  @ApiProperty({ example: 900 })
  accessTokenExpiresIn!: number;
}

export class AuthResponseDto {
  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;

  @ApiProperty({ type: AuthTokensDto })
  tokens!: AuthTokensDto;
}
