/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  // getAllUsers() {
  //   throw new Error('Method not implemented.');
  // }
  constructor(private prisma: PrismaService) {}

  async register(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { name, email, password: hashed },
    });

    return { message: 'User registered successfully' };
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getAllUsers() {
  return this.prisma.user.findMany({
    select: {
      id: true,
      name: true, // assuming 'name' is a single field, not split into first/last
    },
  });
}

}
