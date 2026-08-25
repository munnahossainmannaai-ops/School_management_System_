import { Injectable } from '@nestjs/common';

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  room?: string;
}

export interface TeacherAvailability {
  teacherId: string;
  availableSlots: TimeSlot[];
  unavailableDates: Date[];
}

export interface ClassRequirement {
  classId: string;
  className: string;
  subjects: SubjectRequirement[];
  totalPeriodsPerWeek: number;
}

export interface SubjectRequirement {
  subjectId: string;
  subjectName: string;
  periodsPerWeek: number;
  teacherId?: string;
  preferredDays?: string[];
  doublePeriod?: boolean;
}

export interface GeneratedTimetable {
  classId: string;
  className: string;
  schedule: ScheduleEntry[];
  conflicts: Conflict[];
}

export interface ScheduleEntry {
  day: string;
  period: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  room?: string;
  isDoublePeriod: boolean;
}

export interface Conflict {
  type: 'TEACHER_OVERLAP' | 'ROOM_CONFLICT' | 'PERIOD_CONSTRAINT';
  severity: 'WARNING' | 'ERROR';
  description: string;
  entries?: ScheduleEntry[];
}

@Injectable()
export class TimetableGeneratorService {
  private readonly days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  private readonly periodsPerDay = 8;
  private readonly periodDuration = 45; // minutes
  private readonly startHour = 8; // 8 AM

  /**
   * Generate timetable for multiple classes
   */
  async generateTimetable(
    classRequirements: ClassRequirement[],
    teacherAvailabilities: TeacherAvailability[],
    rooms: string[],
  ): Promise<GeneratedTimetable[]> {
    const timetables: GeneratedTimetable[] = [];
    const conflicts: Conflict[] = [];

    // Initialize teacher schedule matrix
    const teacherSchedule = new Map<string, Set<string>>();
    teacherAvailabilities.forEach(ta => {
      teacherSchedule.set(ta.teacherId, new Set<string>());
    });

    // Initialize room schedule matrix
    const roomSchedule = new Map<string, Set<string>>();
    rooms.forEach(room => {
      roomSchedule.set(room, new Set<string>());
    });

    // Generate timetable for each class
    for (const classReq of classRequirements) {
      const classTimetable = this.generateClassTimetable(
        classReq,
        teacherAvailabilities,
        teacherSchedule,
        roomSchedule,
        rooms,
      );
      
      timetables.push(classTimetable);
      conflicts.push(...classTimetable.conflicts);
    }

    return timetables;
  }

  /**
   * Generate timetable for a single class using greedy algorithm
   */
  private generateClassTimetable(
    classReq: ClassRequirement,
    teacherAvailabilities: TeacherAvailability[],
    teacherSchedule: Map<string, Set<string>>,
    roomSchedule: Map<string, Set<string>>,
    rooms: string[],
  ): GeneratedTimetable {
    const schedule: ScheduleEntry[] = [];
    const conflicts: Conflict[] = [];
    const usedSlots = new Set<string>();

    // Sort subjects by periods per week (descending) to schedule harder constraints first
    const sortedSubjects = [...classReq.subjects].sort(
      (a, b) => b.periodsPerWeek - a.periodsPerWeek,
    );

    for (const subject of sortedSubjects) {
      let periodsScheduled = 0;
      const targetPeriods = subject.periodsPerWeek;

      // Try to schedule all required periods for this subject
      while (periodsScheduled < targetPeriods) {
        let scheduled = false;

        // Iterate through days and periods
        for (const day of this.days) {
          if (scheduled) break;

          for (let period = 1; period <= this.periodsPerDay; period++) {
            if (scheduled) break;
            if (periodsScheduled >= targetPeriods) break;

            const slotKey = `${day}-${period}`;
            
            // Skip if slot already used by this class
            if (usedSlots.has(slotKey)) continue;

            // Check if double period is needed and possible
            const isDoublePeriod = subject.doublePeriod && period <= this.periodsPerDay - 1;
            const nextSlotKey = isDoublePeriod ? `${day}-${period + 1}` : null;
            
            if (isDoublePeriod && usedSlots.has(nextSlotKey!)) continue;

            // Find available teacher
            const teacherId = subject.teacherId || this.findAvailableTeacher(
              subject.subjectId,
              teacherAvailabilities,
              teacherSchedule,
              day,
              period,
              isDoublePeriod,
            );

            if (!teacherId) {
              conflicts.push({
                type: 'TEACHER_OVERLAP',
                severity: 'ERROR',
                description: `No available teacher for ${subject.subjectName} on ${day} period ${period}`,
              });
              continue;
            }

            // Find available room
            const room = this.findAvailableRoom(
              roomSchedule,
              rooms,
              day,
              period,
              isDoublePeriod,
            );

            if (!room) {
              conflicts.push({
                type: 'ROOM_CONFLICT',
                severity: 'WARNING',
                description: `No available room for ${subject.subjectName} on ${day} period ${period}`,
              });
              // Continue without room assignment
            }

            // Calculate time
            const startTime = this.calculateTime(period);
            const endTime = this.calculateTime(isDoublePeriod ? period + 2 : period + 1);

            // Get teacher name (mock - in real app, fetch from database)
            const teacherName = `Teacher ${teacherId.slice(-4)}`;

            // Create schedule entry
            const entry: ScheduleEntry = {
              day,
              period,
              startTime,
              endTime,
              subjectId: subject.subjectId,
              subjectName: subject.subjectName,
              teacherId,
              teacherName,
              room,
              isDoublePeriod,
            };

            schedule.push(entry);
            usedSlots.add(slotKey);
            
            if (isDoublePeriod) {
              usedSlots.add(nextSlotKey!);
              periodsScheduled++;
            }

            // Update teacher schedule
            const teacherSlots = teacherSchedule.get(teacherId)!;
            teacherSlots.add(slotKey);
            if (isDoublePeriod) {
              teacherSlots.add(nextSlotKey!);
            }

            // Update room schedule
            if (room) {
              const roomSlots = roomSchedule.get(room)!;
              roomSlots.add(slotKey);
              if (isDoublePeriod) {
                roomSlots.add(nextSlotKey!);
              }
            }

            periodsScheduled++;
            scheduled = true;
          }
        }

        // If we couldn't schedule any period in this iteration, break to avoid infinite loop
        if (!scheduled) {
          conflicts.push({
            type: 'PERIOD_CONSTRAINT',
            severity: 'ERROR',
            description: `Could not schedule all periods for ${subject.subjectName}. Scheduled: ${periodsScheduled}/${targetPeriods}`,
          });
          break;
        }
      }
    }

    // Sort schedule by day and period
    const dayOrder = new Map(this.days.map((day, index) => [day, index]));
    schedule.sort((a, b) => {
      const dayDiff = dayOrder.get(a.day)! - dayOrder.get(b.day)!;
      if (dayDiff !== 0) return dayDiff;
      return a.period - b.period;
    });

    return {
      classId: classReq.classId,
      className: classReq.className,
      schedule,
      conflicts,
    };
  }

  /**
   * Find available teacher for a subject
   */
  private findAvailableTeacher(
    subjectId: string,
    teacherAvailabilities: TeacherAvailability[],
    teacherSchedule: Map<string, Set<string>>,
    day: string,
    period: number,
    isDoublePeriod: boolean,
  ): string | null {
    const slotKey = `${day}-${period}`;
    const nextSlotKey = isDoublePeriod ? `${day}-${period + 1}` : null;

    for (const availability of teacherAvailabilities) {
      const teacherSlots = teacherSchedule.get(availability.teacherId);
      
      if (!teacherSlots || teacherSlots.has(slotKey)) continue;
      if (isDoublePeriod && teacherSlots.has(nextSlotKey!)) continue;

      // Check if teacher is available on this day
      const isDayAvailable = availability.availableSlots.some(
        slot => slot.day === day,
      );

      if (isDayAvailable) {
        return availability.teacherId;
      }
    }

    return null;
  }

  /**
   * Find available room
   */
  private findAvailableRoom(
    roomSchedule: Map<string, Set<string>>,
    rooms: string[],
    day: string,
    period: number,
    isDoublePeriod: boolean,
  ): string | null {
    const slotKey = `${day}-${period}`;
    const nextSlotKey = isDoublePeriod ? `${day}-${period + 1}` : null;

    for (const room of rooms) {
      const roomSlots = roomSchedule.get(room);
      
      if (!roomSlots || !roomSlots.has(slotKey)) {
        if (!isDoublePeriod || !roomSlots?.has(nextSlotKey!)) {
          return room;
        }
      }
    }

    return null;
  }

  /**
   * Calculate time string for a given period
   */
  private calculateTime(period: number): string {
    const totalMinutes = (period - 1) * this.periodDuration;
    const hours = this.startHour + Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Validate generated timetable for conflicts
   */
  validateTimetable(timetables: GeneratedTimetable[]): Conflict[] {
    const conflicts: Conflict[] = [];

    // Check for teacher overlaps across classes
    const teacherSlots = new Map<string, Array<{ classId: string; entry: ScheduleEntry }>>();

    timetables.forEach(timetable => {
      timetable.schedule.forEach(entry => {
        const key = `${entry.day}-${entry.period}`;
        const existing = teacherSlots.get(`${entry.teacherId}-${key}`);
        
        if (existing) {
          conflicts.push({
            type: 'TEACHER_OVERLAP',
            severity: 'ERROR',
            description: `Teacher ${entry.teacherName} is scheduled for multiple classes at the same time`,
            entries: [existing[0].entry, entry],
          });
        } else {
          teacherSlots.set(`${entry.teacherId}-${key}`, [{ classId: timetable.classId, entry }]);
        }
      });
    });

    return conflicts;
  }

  /**
   * Optimize timetable by minimizing gaps and balancing load
   */
  optimizeTimetable(timetable: GeneratedTimetable): GeneratedTimetable {
    // Implementation of optimization algorithms
    // Could include: genetic algorithms, simulated annealing, or constraint satisfaction
    
    // For now, return the timetable as-is
    // In production, this would implement advanced optimization
    return timetable;
  }
}
