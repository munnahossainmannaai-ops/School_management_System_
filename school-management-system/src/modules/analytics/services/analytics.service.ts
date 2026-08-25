import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { ExaminationResult } from '../examinations/entities/examination-result.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(ExaminationResult)
    private examRepository: Repository<ExaminationResult>,
  ) {}

  async generateStudentRiskAnalysis(classId?: string): Promise<any> {
    const students = await this.studentRepository.find({
      relations: ['attendances', 'examResults'],
      where: classId ? { class: { id: classId } } : {},
    });

    const riskAnalysis = students.map(student => {
      const attendanceRate = this.calculateAttendanceRate(student.attendances);
      const averageGrade = this.calculateAverageGrade(student.examResults);
      
      let riskLevel = 'LOW';
      let riskFactors: string[] = [];

      if (attendanceRate < 75) {
        riskLevel = 'HIGH';
        riskFactors.push('Low attendance');
      } else if (attendanceRate < 85) {
        riskLevel = 'MEDIUM';
        riskFactors.push('Moderate attendance');
      }

      if (averageGrade < 60) {
        riskLevel = 'HIGH';
        riskFactors.push('Poor academic performance');
      } else if (averageGrade < 75) {
        if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
        riskFactors.push('Below average grades');
      }

      return {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        riskLevel,
        riskFactors,
        attendanceRate: Math.round(attendanceRate),
        averageGrade: Math.round(averageGrade),
        recommendations: this.generateRecommendations(riskFactors),
      };
    });

    return {
      totalStudents: students.length,
      highRisk: riskAnalysis.filter(s => s.riskLevel === 'HIGH').length,
      mediumRisk: riskAnalysis.filter(s => s.riskLevel === 'MEDIUM').length,
      lowRisk: riskAnalysis.filter(s => s.riskLevel === 'LOW').length,
      students: riskAnalysis,
    };
  }

  async generatePerformanceTrends(classId?: string, termId?: string): Promise<any> {
    const query = this.examRepository
      .createQueryBuilder('result')
      .innerJoin('result.student', 'student')
      .innerJoin('result.examination', 'exam')
      .where('student.classId = :classId', { classId })
      .orderBy('exam.date', 'ASC');

    if (termId) {
      query.andWhere('exam.termId = :termId', { termId });
    }

    const results = await query.getMany();
    
    const trends: any = {};
    results.forEach(result => {
      const subject = result.examination.subject.name;
      const date = result.examination.date.toISOString().split('T')[0];
      
      if (!trends[subject]) {
        trends[subject] = [];
      }
      
      const existing = trends[subject].find((t: any) => t.date === date);
      if (existing) {
        existing.averageScore = ((existing.averageScore * existing.count) + result.score) / (existing.count + 1);
        existing.count++;
      } else {
        trends[subject].push({
          date,
          averageScore: result.score,
          count: 1,
        });
      }
    });

    return {
      subjects: Object.keys(trends),
      trends: Object.entries(trends).map(([subject, data]: [string, any]) => ({
        subject,
        data: data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      })),
    };
  }

  private calculateAttendanceRate(attendances: any[]): number {
    if (!attendances || attendances.length === 0) return 100;
    const present = attendances.filter(a => a.status === 'PRESENT').length;
    return (present / attendances.length) * 100;
  }

  private calculateAverageGrade(results: any[]): number {
    if (!results || results.length === 0) return 0;
    const total = results.reduce((sum, r) => sum + r.score, 0);
    return total / results.length;
  }

  private generateRecommendations(riskFactors: string[]): string[] {
    const recommendations: string[] = [];
    
    if (riskFactors.includes('Low attendance')) {
      recommendations.push('Schedule parent-teacher meeting to discuss attendance concerns');
      recommendations.push('Implement attendance monitoring plan');
    }
    
    if (riskFactors.includes('Poor academic performance')) {
      recommendations.push('Assign additional tutoring support');
      recommendations.push('Review learning methodology and provide personalized study plan');
    }
    
    if (riskFactors.includes('Below average grades')) {
      recommendations.push('Monitor progress weekly');
      recommendations.push('Consider peer learning groups');
    }

    return recommendations;
  }
}
