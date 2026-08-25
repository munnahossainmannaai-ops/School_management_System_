import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff, User } from '../../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Staff, User])],
  exports: [],
})
export class StaffModule {}
