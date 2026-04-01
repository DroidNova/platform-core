export class AuthUserDto {
  id!: string;
  fullName!: string;
  email!: string | null;
  phone!: string | null;
  status!: string;
  roles!: string[];
}

export class AuthTokensDto {
  accessToken!: string;
  refreshToken!: string;
  accessTokenExpiresIn!: number;
}

export class AuthResponseDto {
  user!: AuthUserDto;
  tokens!: AuthTokensDto;
}
