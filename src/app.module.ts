import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { PrismaModule } from './prisma/prisma.module';
import { UsersController } from './routes/users.routes';
import { UsersService } from './services/users.service';

@Module({
  imports: [PrismaModule],
  controllers: [AppController, UsersController],
  providers: [AppService, UsersService, AuthGuard],
})
export class AppModule {}
