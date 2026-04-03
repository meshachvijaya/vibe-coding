import { Body, Controller, Delete, Get, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginDto } from '../dto/login.dto';
import { UsersService } from '../services/users.service';

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.registerUser(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.usersService.loginUser(loginDto);
  }

  @Get('current')
  async getCurrent(@Headers('authorization') authorization: string) {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Unauthorized');
    }
    const token = authorization.replace('Bearer ', '');
    return this.usersService.getCurrentUser(token);
  }

  @Delete('logout')
  async logout(@Headers('authorization') authorization: string) {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Unauthorized');
    }
    const token = authorization.replace('Bearer ', '');
    const result = await this.usersService.logoutUser(token);
    return { data: result };
  }
}
