import { TensorflowModel } from './models/tensorflow.model';

export interface StudentInsight {
  studentId: string;
  riskLevel: 'low' | 'medium' | 'high';
  dropoutProbability: number;
  performanceTrend: 'improving' | 'stable' | 'declining';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  confidenceScore: number;
}

export interface ClassAnalytics {
  classId: string;
  averagePerformance: number;
  attendanceRate: number;
  engagementScore: number;
  atRiskStudents: number;
  topPerformers: string[];
  subjectWeaknesses: string[];
}

export interface PredictiveMetrics {
  metricType: 'dropout' | 'performance' | 'attendance' | 'behavior';
  predictions: Array<{
    entityId: string;
    predictedValue: number;
    confidence: number;
    timeframe: string;
  }>;
  generatedAt: Date;
}

export interface LearningPath {
  studentId: string;
  personalizedModules: Array<{
    moduleId: string;
    subject: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number;
    prerequisites: string[];
  }>;
  progressTracking: {
    completedModules: number;
    totalModules: number;
    completionRate: number;
  };
}

class AIAnalyticsService {
  private tensorflowModel: TensorflowModel;
  private static instance: AIAnalyticsService;

  private constructor() {
    this.tensorflowModel = new TensorflowModel();
  }

  public static getInstance(): AIAnalyticsService {
    if (!AIAnalyticsService.instance) {
      AIAnalyticsService.instance = new AIAnalyticsService();
    }
    return AIAnalyticsService.instance;
  }

  public async initializeModels(): Promise<void> {
    try {
      await this.tensorflowModel.loadModels();
      console.log('AI models loaded successfully');
    } catch (error) {
      console.error('Failed to load AI models:', error);
      throw error;
    }
  }

  public async analyzeStudent(studentData: {
    studentId: string;
    grades: Array<{ subject: string; score: number; date: Date }>;
    attendance: Array<{ date: Date; present: boolean }>;
    behaviorIncidents: Array<{ date: Date; severity: number; type: string }>;
    participationScores: Array<{ activity: string; score: number }>;
  }): Promise<StudentInsight> {
    try {
      const features = this.extractStudentFeatures(studentData);
      const dropoutProbability = await this.tensorflowModel.predictDropoutRisk(features);
      const performanceTrend = this.analyzePerformanceTrend(studentData.grades);
      
      let riskLevel: StudentInsight['riskLevel'] = 'low';
      if (dropoutProbability > 0.7) {
        riskLevel = 'high';
      } else if (dropoutProbability > 0.4) {
        riskLevel = 'medium';
      }

      const { strengths, weaknesses } = this.identifyStrengthsWeaknesses(studentData.grades);
      const recommendations = this.generateRecommendations(
        riskLevel,
        performanceTrend,
        strengths,
        weaknesses,
        studentData.attendance
      );

      return {
        studentId: studentData.studentId,
        riskLevel,
        dropoutProbability,
        performanceTrend,
        strengths,
        weaknesses,
        recommendations,
        confidenceScore: 1 - dropoutProbability,
      };
    } catch (error) {
      console.error('Error analyzing student:', error);
      throw new Error('Failed to analyze student data');
    }
  }

  public async analyzeClass(classData: {
    classId: string;
    students: Array<{
      studentId: string;
      grades: Array<{ subject: string; score: number }>;
      attendance: Array<{ date: Date; present: boolean }>;
    }>;
  }): Promise<ClassAnalytics> {
    try {
      const allGrades: number[] = [];
      const attendanceRecords: boolean[] = [];
      const studentAnalyses: StudentInsight[] = [];

      for (const student of classData.students) {
        allGrades.push(...student.grades.map((g) => g.score));
        attendanceRecords.push(...student.attendance.map((a) => a.present));

        const analysis = await this.analyzeStudent({
          studentId: student.studentId,
          grades: student.grades.map((g) => ({ ...g, date: new Date() })),
          attendance: student.attendance,
          behaviorIncidents: [],
          participationScores: [],
        });

        studentAnalyses.push(analysis);
      }

      const averagePerformance = allGrades.length > 0 
        ? allGrades.reduce((a, b) => a + b, 0) / allGrades.length 
        : 0;

      const attendanceRate = attendanceRecords.length > 0
        ? (attendanceRecords.filter((a) => a).length / attendanceRecords.length) * 100
        : 0;

      const atRiskStudents = studentAnalyses.filter((s) => s.riskLevel === 'high').length;

      const sortedStudents = [...studentAnalyses].sort(
        (a, b) => b.confidenceScore - a.confidenceScore
      );
      const topPerformers = sortedStudents.slice(0, 5).map((s) => s.studentId);

      const subjectWeaknesses = this.identifyClassSubjectWeaknesses(classData.students);
      const engagementScore = this.calculateEngagementScore(attendanceRate, studentAnalyses);

      return {
        classId: classData.classId,
        averagePerformance,
        attendanceRate,
        engagementScore,
        atRiskStudents,
        topPerformers,
        subjectWeaknesses,
      };
    } catch (error) {
      console.error('Error analyzing class:', error);
      throw new Error('Failed to analyze class data');
    }
  }

  public async generatePredictiveMetrics(
    metricType: PredictiveMetrics['metricType'],
    entityIds: string[]
  ): Promise<PredictiveMetrics> {
    try {
      const predictions = await Promise.all(
        entityIds.map(async (entityId) => {
          const predictedValue = Math.random();
          const confidence = 0.7 + Math.random() * 0.25;

          return {
            entityId,
            predictedValue,
            confidence,
            timeframe: 'next_30_days',
          };
        })
      );

      return {
        metricType,
        predictions,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error generating predictive metrics:', error);
      throw new Error('Failed to generate predictive metrics');
    }
  }

  public async generateLearningPath(studentAnalysis: StudentInsight): Promise<LearningPath> {
    try {
      const personalizedModules: LearningPath['personalizedModules'] = [];

      for (const weakness of studentAnalysis.weaknesses) {
        personalizedModules.push({
          moduleId: `module_${weakness.toLowerCase()}_basic`,
          subject: weakness,
          difficulty: 'beginner',
          estimatedTime: 10,
          prerequisites: [],
        });

        personalizedModules.push({
          moduleId: `module_${weakness.toLowerCase()}_intermediate`,
          subject: weakness,
          difficulty: 'intermediate',
          estimatedTime: 15,
          prerequisites: [`module_${weakness.toLowerCase()}_basic`],
        });
      }

      for (const strength of studentAnalysis.strengths.slice(0, 2)) {
        personalizedModules.push({
          moduleId: `module_${strength.toLowerCase()}_advanced`,
          subject: strength,
          difficulty: 'advanced',
          estimatedTime: 20,
          prerequisites: [],
        });
      }

      return {
        studentId: studentAnalysis.studentId,
        personalizedModules,
        progressTracking: {
          completedModules: 0,
          totalModules: personalizedModules.length,
          completionRate: 0,
        },
      };
    } catch (error) {
      console.error('Error generating learning path:', error);
      throw new Error('Failed to generate learning path');
    }
  }

  private extractStudentFeatures(studentData: any): number[] {
    const features: number[] = [];

    const avgGrade = studentData.grades.length > 0
      ? studentData.grades.reduce((sum: number, g: any) => sum + g.score, 0) / studentData.grades.length
      : 0;
    features.push(avgGrade);

    const gradeTrend = this.calculateTrend(studentData.grades.map((g: any) => g.score));
    features.push(gradeTrend);

    const attendanceRate = studentData.attendance.length > 0
      ? studentData.attendance.filter((a: any) => a.present).length / studentData.attendance.length
      : 0;
    features.push(attendanceRate);

    const behaviorScore = 1 - (studentData.behaviorIncidents.length * 0.1);
    features.push(Math.max(0, behaviorScore));

    const participationAvg = studentData.participationScores.length > 0
      ? studentData.participationScores.reduce((sum: number, p: any) => sum + p.score, 0) / studentData.participationScores.length
      : 0.5;
    features.push(participationAvg);

    return features;
  }

  private analyzePerformanceTrend(grades: Array<{ score: number; date: Date }>): StudentInsight['performanceTrend'] {
    if (grades.length < 2) return 'stable';

    const sortedGrades = [...grades].sort((a, b) => a.date.getTime() - b.date.getTime());
    const scores = sortedGrades.map((g) => g.score);
    const trend = this.calculateTrend(scores);

    if (trend > 5) return 'improving';
    if (trend < -5) return 'declining';
    return 'stable';
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const xSum = (n * (n - 1)) / 2;
    const ySum = values.reduce((a, b) => a + b, 0);
    const xySum = values.reduce((sum, val, idx) => sum + idx * val, 0);
    const xxSum = values.reduce((sum, _, idx) => sum + idx * idx, 0);

    const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
    return slope;
  }

  private identifyStrengthsWeaknesses(grades: Array<{ subject: string; score: number }>): {
    strengths: string[];
    weaknesses: string[];
  } {
    const subjectAverages: Record<string, number[]> = {};

    grades.forEach((grade) => {
      if (!subjectAverages[grade.subject]) {
        subjectAverages[grade.subject] = [];
      }
      subjectAverages[grade.subject].push(grade.score);
    });

    const averages = Object.entries(subjectAverages).map(([subject, scores]) => ({
      subject,
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
    }));

    const strengths = averages
      .filter((s) => s.average >= 85)
      .map((s) => s.subject);

    const weaknesses = averages
      .filter((s) => s.average < 70)
      .map((s) => s.subject);

    return { strengths, weaknesses };
  }

  private generateRecommendations(
    riskLevel: StudentInsight['riskLevel'],
    performanceTrend: StudentInsight['performanceTrend'],
    strengths: string[],
    weaknesses: string[],
    attendance: Array<{ date: Date; present: boolean }>
  ): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'high') {
      recommendations.push('Schedule immediate counseling session');
      recommendations.push('Arrange parent-teacher meeting');
    }

    if (performanceTrend === 'declining') {
      recommendations.push('Provide additional tutoring support');
      recommendations.push('Review study habits and time management');
    }

    weaknesses.forEach((subject) => {
      recommendations.push(`Focus on improving ${subject} skills with practice exercises`);
    });

    strengths.forEach((subject) => {
      recommendations.push(`Consider advanced ${subject} courses or competitions`);
    });

    const attendanceRate = attendance.length > 0
      ? attendance.filter((a) => a.present).length / attendance.length
      : 1;

    if (attendanceRate < 0.85) {
      recommendations.push('Improve attendance - regular class participation is crucial');
    }

    return recommendations;
  }

  private identifyClassSubjectWeaknesses(
    students: Array<{ grades: Array<{ subject: string; score: number }> }>
  ): string[] {
    const subjectScores: Record<string, number[]> = {};

    students.forEach((student) => {
      student.grades.forEach((grade) => {
        if (!subjectScores[grade.subject]) {
          subjectScores[grade.subject] = [];
        }
        subjectScores[grade.subject].push(grade.score);
      });
    });

    const weaknesses: string[] = [];
    Object.entries(subjectScores).forEach(([subject, scores]) => {
      const average = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (average < 75) {
        weaknesses.push(subject);
      }
    });

    return weaknesses;
  }

  private calculateEngagementScore(attendanceRate: number, analyses: StudentInsight[]): number {
    const avgConfidence = analyses.reduce((sum, a) => sum + a.confidenceScore, 0) / analyses.length;
    return (attendanceRate * 0.6 + avgConfidence * 100 * 0.4);
  }
}

export const aiAnalyticsService = AIAnalyticsService.getInstance();
export default aiAnalyticsService;
