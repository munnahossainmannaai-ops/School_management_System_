import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BiometricAttendanceController } from './controllers/biometric-attendance.controller';
import { BiometricAttendanceService } from './services/biometric-attendance.service';
import { BiometricRecord } from './entities/biometric-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BiometricRecord])],
  controllers: [BiometricAttendanceController],
  providers: [BiometricAttendanceService],
  exports: [BiometricAttendanceService],
})
export class BiometricAttendanceModule {}
