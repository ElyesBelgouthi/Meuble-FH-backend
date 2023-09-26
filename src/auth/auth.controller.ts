import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';

import { LoginAuthDto } from './dto/login-auth.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  signup(@Body(ValidationPipe) loginAuthDto: LoginAuthDto): Promise<void> {
    return this.authService.signup(loginAuthDto);
  }

  @Post('/login')
  login(
    @Body(ValidationPipe) loginAuthDto: LoginAuthDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(loginAuthDto);
  }
}
