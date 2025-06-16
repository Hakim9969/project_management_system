/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    return req.user; // comes from validate() in jwt.strategy.ts
  }
  constructor(private userService: UserService) {}

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.userService.register(dto);
  }

  @UseGuards(JwtAuthGuard)
@Get()
getAllUsers() {
  return this.userService.getAllUsers();
}

}
