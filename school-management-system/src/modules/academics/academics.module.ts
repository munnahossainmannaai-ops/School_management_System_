import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicClass, Section, Subject, AcademicSession, Term } from '../../database/entities/academic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicClass, Section, Subject, AcademicSession, Term])],
  exports: [],
})
export class AcademicsModule {}
