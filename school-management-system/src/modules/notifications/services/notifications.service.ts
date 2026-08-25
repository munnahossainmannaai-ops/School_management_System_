import { Injectable, Inject } from '@nestjs/common';
import { NotificationsGateway } from './gateways/notifications.gateway';

export enum NotificationType {
  ATTENDANCE_ALERT = 'attendance_alert',
  EXAM_REMINDER = 'exam_reminder',
  FEE_DUE = 'fee_due',
  ASSIGNMENT_POSTED = 'assignment_posted',
  GRADE_PUBLISHED = 'grade_published',
  ANNOUNCEMENT = 'announcement',
  EMERGENCY = 'emergency',
  PARENT_MEETING = 'parent_meeting',
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt?: Date;
}

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NotificationsGateway)
    private gateway: NotificationsGateway,
  ) {}

  /**
   * Send attendance alert to parents when student is absent
   */
  async sendAttendanceAlert(studentId: string, studentName: string, parentIds: string[]) {
    const payload: NotificationPayload = {
      type: NotificationType.ATTENDANCE_ALERT,
      title: 'Attendance Alert',
      message: `${studentName} was marked absent today.`,
      priority: 'HIGH',
      data: { studentId, studentName },
      createdAt: new Date(),
    };

    // Send to all parents
    this.gateway.sendToUsers(parentIds, 'notification', payload);
    
    // Also send to teachers of the class
    this.gateway.sendToRole('TEACHER', 'notification', {
      ...payload,
      title: 'Student Absent',
      message: `${studentName} is absent today.`,
    });
  }

  /**
   * Send exam reminder to students and parents
   */
  async sendExamReminder(
    examName: string,
    subject: string,
    date: Date,
    studentIds: string[],
    parentIds: string[],
  ) {
    const payload: NotificationPayload = {
      type: NotificationType.EXAM_REMINDER,
      title: 'Upcoming Examination',
      message: `${subject} - ${examName} scheduled for ${date.toDateString()}`,
      priority: 'MEDIUM',
      data: { examName, subject, date },
      createdAt: new Date(),
    };

    this.gateway.sendToUsers(studentIds, 'notification', payload);
    this.gateway.sendToUsers(parentIds, 'notification', {
      ...payload,
      title: 'Child\'s Upcoming Exam',
    });
  }

  /**
   * Send fee due notification to parents
   */
  async sendFeeDueNotification(
    studentName: string,
    amount: number,
    dueDate: Date,
    parentIds: string[],
  ) {
    const payload: NotificationPayload = {
      type: NotificationType.FEE_DUE,
      title: 'Fee Payment Due',
      message: `Fee of $${amount} for ${studentName} is due by ${dueDate.toDateString()}`,
      priority: 'HIGH',
      data: { studentName, amount, dueDate },
      createdAt: new Date(),
    };

    this.gateway.sendToUsers(parentIds, 'notification', payload);
  }

  /**
   * Send grade publication notification
   */
  async sendGradePublished(
    studentName: string,
    examName: string,
    subject: string,
    studentId: string,
    parentId: string,
  ) {
    const studentPayload: NotificationPayload = {
      type: NotificationType.GRADE_PUBLISHED,
      title: 'Grades Published',
      message: `Your grades for ${examName} (${subject}) have been published.`,
      priority: 'MEDIUM',
      data: { studentName, examName, subject },
      createdAt: new Date(),
    };

    const parentPayload: NotificationPayload = {
      ...studentPayload,
      title: 'Child\'s Grades Published',
      message: `${studentName}'s grades for ${examName} (${subject}) have been published.`,
    };

    this.gateway.sendToUser(studentId, 'notification', studentPayload);
    this.gateway.sendToUser(parentId, 'notification', parentPayload);
  }

  /**
   * Send school-wide announcement
   */
  async sendAnnouncement(title: string, message: string, targetRoles?: string[]) {
    const payload: NotificationPayload = {
      type: NotificationType.ANNOUNCEMENT,
      title,
      message,
      priority: 'MEDIUM',
      createdAt: new Date(),
    };

    if (targetRoles && targetRoles.length > 0) {
      targetRoles.forEach(role => {
        this.gateway.sendToRole(role, 'notification', payload);
      });
    } else {
      this.gateway.sendToAll('notification', payload);
    }
  }

  /**
   * Send emergency alert to all users
   */
  async sendEmergencyAlert(title: string, message: string) {
    const payload: NotificationPayload = {
      type: NotificationType.EMERGENCY,
      title,
      message,
      priority: 'URGENT',
      createdAt: new Date(),
    };

    this.gateway.sendToAll('emergency', payload);
    
    // Also send via role-based channels for redundancy
    ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'].forEach(role => {
      this.gateway.sendToRole(role, 'emergency', payload);
    });
  }

  /**
   * Send parent-teacher meeting invitation
   */
  async sendMeetingInvitation(
    teacherName: string,
    parentName: string,
    dateTime: Date,
    purpose: string,
    parentId: string,
    teacherId: string,
  ) {
    const parentPayload: NotificationPayload = {
      type: NotificationType.PARENT_MEETING,
      title: 'Parent-Teacher Meeting Invitation',
      message: `Meeting with ${teacherName} scheduled for ${dateTime.toLocaleString()}. Purpose: ${purpose}`,
      priority: 'HIGH',
      data: { teacherName, dateTime, purpose },
      createdAt: new Date(),
    };

    const teacherPayload: NotificationPayload = {
      ...parentPayload,
      title: 'Meeting Scheduled',
      message: `Meeting with ${parentName} confirmed for ${dateTime.toLocaleString()}.`,
    };

    this.gateway.sendToUser(parentId, 'notification', parentPayload);
    this.gateway.sendToUser(teacherId, 'notification', teacherPayload);
  }
}
