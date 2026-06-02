import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Alex Johnson',
    description:
      "User full name. Allows letters, spaces, hyphens, and apostrophes.",
    minLength: 2,
    maxLength: 50,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Full name must be a string' })
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(50, { message: 'Full name must be 50 characters or less' })
  @Matches(/^[A-Za-zÀ-ÿ' -]+$/, {
    message:
      'Full name can only contain letters, spaces, hyphens, and apostrophes',
  })
  fullName!: string;

  @ApiPropertyOptional({
    example: 'alex@platformcore.dev',
    description: 'User email address. Optional, but must be valid if provided.',
    maxLength: 254,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MaxLength(254, { message: 'Email must be 254 characters or less' })
  email?: string;

  @ApiPropertyOptional({
    example: '+14155550123',
    description:
      'User phone number in international format. Allows optional leading + followed by digits.',
    minLength: 6,
    maxLength: 20,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MinLength(6, { message: 'Phone must be at least 6 characters' })
  @MaxLength(20, { message: 'Phone must be 20 characters or less' })
  @Matches(/^\+?[1-9]\d{5,19}$/, {
    message: 'Phone must be a valid international phone number',
  })
  phone?: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'User password. Must be between 8 and 128 characters.',
    minLength: 8,
    maxLength: 128,
    format: 'password',
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password must be 128 characters or less' })
  @Matches(/\S/, { message: 'Password cannot be only whitespace' })
  password!: string;
}
