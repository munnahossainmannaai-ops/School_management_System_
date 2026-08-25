import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from '../../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Staff])],
  exports: [],
})
export class StaffModule {}
