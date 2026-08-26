import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { StudentPerformance } from './entities/student-performance.entity';
import { AttendancePattern } from './entities/attendance-pattern.entity';
import { RiskAssessment } from './entities/risk-assessment.entity';
import { Student, User } from '../../../database/entities/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AiAnalyticsService {
  private readonly logger = new Logger(AiAnalyticsService.name);

  constructor(
    @InjectRepository(StudentPerformance)
    private performanceRepo: Repository<StudentPerformance>,
    @InjectRepository(AttendancePattern)
    private attendanceRepo: Repository<AttendancePattern>,
    @InjectRepository(RiskAssessment)
    private riskRepo: Repository<RiskAssessment>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
  ) {}

  async analyzeStudentPerformance(studentId: string): Promise<StudentPerformance> {
    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!student) {
      throw new Error('Student not found');
    }

    // Calculate performance metrics (simplified - in production, use ML models)
    const averageGrade = await this.calculateAverageGrade(studentId);
    const attendancePercentage = await this.calculateAttendancePercentage(studentId);
    const subjectWisePerformance = await this.getSubjectWisePerformance(studentId);
    const trendData = await this.analyzeTrend(studentId);
    
    const performanceTrend = this.determineTrend(trendData);

    const performance = this.performanceRepo.create({
      student,
      averageGrade,
      attendancePercentage,
      subjectWisePerformance,
      trendData,
      performanceTrend,
    });

    return this.performanceRepo.save(performance);
  }

  async assessDropoutRisk(studentId: string): Promise<RiskAssessment> {
    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!student) {
      throw new Error('Student not found');
    }

    const performance = await this.getLatestPerformance(studentId);
    const attendance = await this.getLatestAttendancePattern(studentId);

    const academicRiskScore = this.calculateAcademicRisk(performance);
    const behavioralRiskScore = this.calculateBehavioralRisk(studentId);
    const dropoutRiskScore = (academicRiskScore + behavioralRiskScore) / 2;

    const riskLevel = this.determineRiskLevel(dropoutRiskScore);
    const riskFactors = this.identifyRiskFactors(performance, attendance);
    const recommendations = this.generateRecommendations(riskFactors, riskLevel);

    const assessment = this.riskRepo.create({
      student,
      riskLevel,
      dropoutRiskScore,
      academicRiskScore,
      behavioralRiskScore,
      riskFactors,
      recommendations,
    });

    return this.riskRepo.save(assessment);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async runDailyAnalytics(): Promise<void> {
    this.logger.log('Running daily analytics for all students...');
    
    const students = await this.studentRepo.find();
    
    for (const student of students) {
      try {
        await this.analyzeStudentPerformance(student.id);
        await this.assessDropoutRisk(student.id);
        await this.analyzeAttendancePatterns(student.id);
      } catch (error) {
        this.logger.error(`Error analyzing student ${student.id}: ${error.message}`);
      }
    }
    
    this.logger.log('Daily analytics completed');
  }

  private calculateAcademicRisk(performance: StudentPerformance | null): number {
    if (!performance) return 0.5;
    
    let risk = 0;
    if (performance.averageGrade < 60) risk += 0.3;
    if (performance.performanceTrend === 'declining') risk += 0.3;
    if (performance.attendancePercentage < 75) risk += 0.4;
    
    return Math.min(risk, 1);
  }

  private calculateBehavioralRisk(studentId: string): number {
    // Simplified - integrate with behavior tracking system
    return 0.2;
  }

  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  private identifyRiskFactors(performance: StudentPerformance | null, attendance: AttendancePattern | null): string[] {
    const factors: string[] = [];
    
    if (performance?.averageGrade < 60) factors.push('Low academic performance');
    if (performance?.performanceTrend === 'declining') factors.push('Declining grades');
    if ((performance?.attendancePercentage || 100) < 75) factors.push('Poor attendance');
    if (attendance?.consecutiveAbsences > 3) factors.push('Multiple consecutive absences');
    if (attendance?.isAtRisk) factors.push('Irregular attendance pattern');
    
    return factors;
  }

  private generateRecommendations(factors: string[], riskLevel: string): string {
    const recommendations: string[] = [];
    
    if (factors.includes('Low academic performance')) {
      recommendations.push('Schedule tutoring sessions');
      recommendations.push('Meet with subject teachers');
    }
    if (factors.includes('Poor attendance')) {
      recommendations.push('Contact parents/guardians');
      recommendations.push('Implement attendance improvement plan');
    }
    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('Immediate counselor intervention required');
      recommendations.push('Develop personalized support plan');
    }
    
    return recommendations.join('. ');
  }

  // Helper methods (implement based on your data structure)
  private async calculateAverageGrade(studentId: string): Promise<number> {
    // Implement grade calculation logic
    return 75.5;
  }

  private async calculateAttendancePercentage(studentId: string): Promise<number> {
    // Implement attendance calculation logic
    return 85.0;
  }

  private async getSubjectWisePerformance(studentId: string): Promise<Record<string, number>> {
    // Implement subject-wise performance logic
    return { Mathematics: 80, Science: 75, English: 85 };
  }

  private async analyzeTrend(studentId: string): Promise<Record<string, number[]>> {
    // Implement trend analysis logic
    return { Mathematics: [70, 75, 80], Science: [80, 78, 75], English: [82, 84, 85] };
  }

  private determineTrend(trendData: Record<string, number[]>): 'improving' | 'stable' | 'declining' {
    // Implement trend determination logic
    return 'stable';
  }

  private async getLatestPerformance(studentId: string): Promise<StudentPerformance | null> {
    return this.performanceRepo.findOne({
      where: { student: { id: studentId } },
      order: { analyzedAt: 'DESC' },
    });
  }

  private async getLatestAttendancePattern(studentId: string): Promise<AttendancePattern | null> {
    return this.attendanceRepo.findOne({
      where: { student: { id: studentId } },
      order: { analyzedAt: 'DESC' },
    });
  }

  private async analyzeAttendancePatterns(studentId: string): Promise<AttendancePattern> {
    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    
    const weeklyPattern = await this.calculateWeeklyPattern(studentId);
    const punctualityScore = await this.calculatePunctualityScore(studentId);
    const consecutiveAbsences = await this.countConsecutiveAbsences(studentId);
    const absenceReasons = await this.getAbsenceReasons(studentId);
    const isAtRisk = consecutiveAbsences > 3 || punctualityScore < 0.6;

    const pattern = this.attendanceRepo.create({
      student,
      weeklyPattern,
      punctualityScore,
      consecutiveAbsences,
      absenceReasons,
      isAtRisk,
    });

    return this.attendanceRepo.save(pattern);
  }

  private async calculateWeeklyPattern(studentId: string): Promise<Record<string, boolean>> {
    return { Monday: true, Tuesday: true, Wednesday: false, Thursday: true, Friday: true };
  }

  private async calculatePunctualityScore(studentId: string): Promise<number> {
    return 0.85;
  }

  private async countConsecutiveAbsences(studentId: string): Promise<number> {
    return 0;
  }

  private async getAbsenceReasons(studentId: string): Promise<Record<string, number>> {
    return { illness: 2, family: 1, other: 0 };
  }
}
