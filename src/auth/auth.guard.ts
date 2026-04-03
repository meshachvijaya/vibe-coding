import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Unauthorized');
    }

    const token = authorization.replace('Bearer ', '');
    const session = await this.prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiredAt < new Date()) {
      throw new UnauthorizedException('Unauthorized');
    }

    // Attach user and token to request object for later use in controllers
    request.user = session.user;
    request.token = token;

    return true;
  }
}
