import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Examination, ExamSchedule, ExamResult, ReportCard } from '../../database/entities/examination.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Examination, ExamSchedule, ExamResult, ReportCard])],
  exports: [],
})
export class ExaminationsModule {}
