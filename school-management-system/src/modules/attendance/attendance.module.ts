import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyAttendance, MonthlyAttendanceSummary } from '../../database/entities/attendance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DailyAttendance, MonthlyAttendanceSummary])],
  exports: [],
})
export class AttendanceModule {}
