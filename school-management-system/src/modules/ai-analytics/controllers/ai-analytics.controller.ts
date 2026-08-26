import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AiAnalyticsService } from './services/ai-analytics.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../database/entities/user.entity';

@Controller('api/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiAnalyticsController {
  constructor(private readonly aiAnalyticsService: AiAnalyticsService) {}

  @Get('student/:id/performance')
  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.STUDENT)
  async getStudentPerformance(@Param('id') studentId: string) {
    return this.aiAnalyticsService.analyzeStudentPerformance(studentId);
  }

  @Get('student/:id/risk-assessment')
  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.COUNSELOR)
  async getRiskAssessment(@Param('id') studentId: string) {
    return this.aiAnalyticsService.assessDropoutRisk(studentId);
  }

  @Post('student/:id/analyze')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async triggerAnalysis(@Param('id') studentId: string) {
    await this.aiAnalyticsService.analyzeStudentPerformance(studentId);
    const riskAssessment = await this.aiAnalyticsService.assessDropoutRisk(studentId);
    return { message: 'Analysis completed', riskAssessment };
  }

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async getDashboardAnalytics() {
    // Return aggregated analytics for dashboard
    return {
      totalStudents: 0,
      atRiskStudents: 0,
      averagePerformance: 0,
      attendanceRate: 0,
    };
  }
}
