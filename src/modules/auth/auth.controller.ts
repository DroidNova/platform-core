import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';
import { AuthService } from './auth.service';
import { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedUser } from './types/jwt-payload.type';

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

const standardErrorSchema = {
  example: {
    success: false,
    statusCode: 400,
    message: 'Error message',
    timestamp: '2026-04-01T00:00:00.000Z',
    path: '/api/v1/auth/login',
  },
};

@ApiTags('Auth')
@ApiExtraModels(SuccessResponseDto, AuthResponseDto, AuthUserDto)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponseDto' },
        { properties: { data: { $ref: '#/components/schemas/AuthResponseDto' } } },
      ],
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation or registration failure',
    schema: standardErrorSchema,
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate a user and issue tokens' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponseDto' },
        { properties: { data: { $ref: '#/components/schemas/AuthResponseDto' } } },
      ],
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
    schema: standardErrorSchema,
  })
  login(@Body() loginDto: LoginDto, @Req() req: Request) {
    return this.authService.login(loginDto, req.get('user-agent'));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refresh successful',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponseDto' },
        { properties: { data: { $ref: '#/components/schemas/AuthResponseDto' } } },
      ],
    },
  })
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invalidate a refresh token session' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logout successful',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponseDto' },
        { properties: { data: { type: 'object', example: { loggedOut: true } } } },
      ],
    },
  })
  logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get currently authenticated user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current user fetched successfully',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponseDto' },
        { properties: { data: { $ref: '#/components/schemas/AuthUserDto' } } },
      ],
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Access token is missing or invalid',
    schema: standardErrorSchema,
  })
  me(@Req() req: AuthenticatedRequest) {
    return this.authService.getCurrentUser(req.user.id);
  }
}
