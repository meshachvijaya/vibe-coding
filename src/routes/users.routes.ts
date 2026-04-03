import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from '../services/users.service';

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.registerUser(createUserDto);
  }
}
