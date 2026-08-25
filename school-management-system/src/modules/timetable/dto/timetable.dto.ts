import { IsString, IsArray, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubjectRequirementDto {
  @ApiProperty()
  @IsString()
  subjectId: string;

  @ApiProperty()
  @IsString()
  subjectName: string;

  @ApiProperty()
  @IsString()
  periodsPerWeek: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredDays?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  doublePeriod?: boolean;
}

export class ClassRequirementDto {
  @ApiProperty()
  @IsString()
  classId: string;

  @ApiProperty()
  @IsString()
  className: string;

  @ApiProperty({ type: [SubjectRequirementDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectRequirementDto)
  subjects: SubjectRequirementDto[];

  @ApiProperty()
  @IsString()
  totalPeriodsPerWeek: number;
}

export class TeacherAvailabilityDto {
  @ApiProperty()
  @IsString()
  teacherId: string;

  @ApiProperty({
    type: 'array',
    items: {
      properties: {
        day: { type: 'string' },
        startTime: { type: 'string' },
        endTime: { type: 'string' },
        room: { type: 'string' },
      },
    },
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  availableSlots: TimeSlotDto[];

  @ApiPropertyOptional({ type: [Date] })
  @IsOptional()
  @IsArray()
  unavailableDates?: Date[];
}

export class TimeSlotDto {
  @ApiProperty()
  @IsString()
  day: string;

  @ApiProperty()
  @IsString()
  startTime: string;

  @ApiProperty()
  @IsString()
  endTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  room?: string;
}

export class GenerateTimetableDto {
  @ApiProperty({ type: [ClassRequirementDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassRequirementDto)
  classRequirements: ClassRequirementDto[];

  @ApiProperty({ type: [TeacherAvailabilityDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeacherAvailabilityDto)
  teacherAvailabilities: TeacherAvailabilityDto[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  rooms: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  optimize?: boolean = false;
}

export class ScheduleEntryResponseDto {
  @ApiProperty()
  day: string;

  @ApiProperty()
  period: number;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  subjectId: string;

  @ApiProperty()
  subjectName: string;

  @ApiProperty()
  teacherId: string;

  @ApiProperty()
  teacherName: string;

  @ApiPropertyOptional()
  room?: string;

  @ApiProperty()
  isDoublePeriod: boolean;
}

export class ConflictResponseDto {
  @ApiProperty({ enum: ['TEACHER_OVERLAP', 'ROOM_CONFLICT', 'PERIOD_CONSTRAINT'] })
  type: string;

  @ApiProperty({ enum: ['WARNING', 'ERROR'] })
  severity: string;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional({ type: [ScheduleEntryResponseDto] })
  entries?: ScheduleEntryResponseDto[];
}

export class GeneratedTimetableResponseDto {
  @ApiProperty()
  classId: string;

  @ApiProperty()
  className: string;

  @ApiProperty({ type: [ScheduleEntryResponseDto] })
  schedule: ScheduleEntryResponseDto[];

  @ApiProperty({ type: [ConflictResponseDto] })
  conflicts: ConflictResponseDto[];
}
