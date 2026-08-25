import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student])],
  exports: [],
})
export class StudentsModule {}
