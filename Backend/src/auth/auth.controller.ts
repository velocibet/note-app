import { Controller, Req, Res, UseGuards, Get, Post, Body, Patch, Delete, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ChangeMasterKeyDto, VerifyPasswordDto } from './dto/create-auth.dto';
import { LoggedInGuard } from './auth.guard';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @Post('register')
  async getRegister(@Body() registerAuthDto: RegisterDto) {
    return await this.authService.getRegister(registerAuthDto);
  }

  @Post('login')
  async getLogin(@Body() loginAuthDto: LoginDto, @Req() req: Request){
    return await this.authService.getLogin(loginAuthDto, req.session);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.getLogout(req.session);
    res.clearCookie('umjunsik_auth');

    return "You have been logged out.";
  }

  @Get('me')
  @UseGuards(LoggedInGuard)
  async getMe(@Req() req: Request) {
    return req.session.user;
  }

  @Delete('withdraw')
  @UseGuards(LoggedInGuard)
  async withdraw(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    if (!req.session.user?.id) throw new UnauthorizedException("Please log in and try again.");

    const userId = req.session.user.id;
    await this.authService.withdraw(userId, req.session);
    res.clearCookie('umjunsik_auth');
    return "Your account has been successfully deleted.";
  }

  @Patch('change-master-key')
  @UseGuards(LoggedInGuard)
  async changeMasterKey(
    @Req() req: Request,
    @Body() body: ChangeMasterKeyDto
  ) {
    if (!req.session.user) throw new UnauthorizedException("Please log in and try again.");

    const userId = req.session.user.id;
    return this.authService.changeMasterKey(userId, body);
  }

  @Post('verify-password')
  @UseGuards(LoggedInGuard)
  async verifyPassword(
    @Req() req: Request,
    @Body() body: VerifyPasswordDto
  ) {
    if (!req.session.user?.id) {
      throw new UnauthorizedException('Please log in and try again.');
    }

    const userId = req.session.user.id;
    return this.authService.verifyPassword(userId, body.password);
  }
}