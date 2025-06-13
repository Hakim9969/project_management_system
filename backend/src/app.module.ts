import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UserModule, AuthModule, ProjectModule, ConfigModule.forRoot({
      isGlobal: true,
    }),],
  providers: [PrismaService],
})
export class AppModule {}
