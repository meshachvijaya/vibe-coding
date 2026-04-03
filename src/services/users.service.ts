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

  async getCurrentUser(token: string) {
    // 1. Find session by token and include user
    const session = await this.prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    // 2. Validate session existence and expiration
    if (!session || session.expiredAt < new Date()) {
      throw new UnauthorizedException('Unauthorized');
    }

    // 3. Return formatted user data
    return {
      data: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        created_at: session.user.createdAt,
      },
    };
  }
}
