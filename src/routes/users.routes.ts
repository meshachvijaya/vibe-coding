import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentToken, CurrentUser } from '../auth/auth.decorator';
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
  @UseGuards(AuthGuard)
  async getCurrent(@CurrentUser() user: any) {
    return {
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.createdAt,
      },
    };
  }

  @Delete('logout')
  @UseGuards(AuthGuard)
  async logout(@CurrentToken() token: string) {
    const result = await this.usersService.logoutUser(token);
    return { data: result };
  }
}
