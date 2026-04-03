import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginDto } from '../dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async registerUser(dto: CreateUserDto) {
    // 1. Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Save user to database
    await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
    });

    return { data: 'OK' };
  }

  async loginUser(dto: LoginDto) {
    // 1. Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('Email or password is wrong');
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Email or password is wrong');
    }

    // 3. Generate Token (UUID)
    const token = uuidv4();

    // 4. Set expiration (24 hours)
    const expiredAt = new Date();
    expiredAt.setHours(expiredAt.getHours() + 24);

    // 5. Save session to DB
    await this.prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiredAt,
      },
    });

    return { data: token };
  }

  async logoutUser(token: string) {
    try {
      // 1. Single delete operation (Optimization)
      await this.prisma.session.delete({
        where: { token },
      });
      return 'Ok';
    } catch (error) {
      // 2. Handle Prisma error P2025 (Record not found)
      if (error.code === 'P2025') {
        throw new UnauthorizedException('Unauthorized');
      }
      throw error;
    }
  }
}
