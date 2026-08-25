import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './services/users.service';
import { User, Student, Staff } from '../../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Student, Staff])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
