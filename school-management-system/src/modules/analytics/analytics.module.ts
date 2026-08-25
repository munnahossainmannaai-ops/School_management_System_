import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './services/analytics.service';
import { Student } from '../students/entities/student.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { ExaminationResult } from '../examinations/entities/examination-result.entity';
import { Examination } from '../examinations/entities/examination.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Attendance, ExaminationResult, Examination]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
