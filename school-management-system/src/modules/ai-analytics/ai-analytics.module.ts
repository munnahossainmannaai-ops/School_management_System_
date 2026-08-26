import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAnalyticsController } from './controllers/ai-analytics.controller';
import { AiAnalyticsService } from './services/ai-analytics.service';
import { StudentPerformance } from './entities/student-performance.entity';
import { AttendancePattern } from './entities/attendance-pattern.entity';
import { RiskAssessment } from './entities/risk-assessment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentPerformance, AttendancePattern, RiskAssessment]),
  ],
  controllers: [AiAnalyticsController],
  providers: [AiAnalyticsService],
  exports: [AiAnalyticsService],
})
export class AiAnalyticsModule {}
