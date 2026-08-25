import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsReportDto } from './dto/analytics-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('risk-analysis')
  @ApiOperation({ summary: 'Generate student risk analysis report' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async getRiskAnalysis(@Query() query: AnalyticsReportDto) {
    return this.analyticsService.generateStudentRiskAnalysis(query.classId);
  }

  @Get('performance-trends')
  @ApiOperation({ summary: 'Get academic performance trends' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async getPerformanceTrends(@Query() query: AnalyticsReportDto) {
    return this.analyticsService.generatePerformanceTrends(query.classId, query.termId);
  }

  @Get('dashboard-summary')
  @ApiOperation({ summary: 'Get dashboard summary statistics' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  async getDashboardSummary(@Query('classId') classId?: string) {
    const [riskAnalysis, performanceTrends] = await Promise.all([
      this.analyticsService.generateStudentRiskAnalysis(classId),
      this.analyticsService.generatePerformanceTrends(classId),
    ]);

    return {
      overview: {
        totalStudents: riskAnalysis.totalStudents,
        riskDistribution: {
          high: riskAnalysis.highRisk,
          medium: riskAnalysis.mediumRisk,
          low: riskAnalysis.lowRisk,
        },
      },
      performanceHighlights: performanceTrends.trends.slice(0, 3),
      recentInsights: riskAnalysis.students
        .filter(s => s.riskLevel !== 'LOW')
        .slice(0, 5)
        .map(s => ({
          studentName: s.studentName,
          riskLevel: s.riskLevel,
          primaryConcern: s.riskFactors[0],
        })),
    };
  }
}
