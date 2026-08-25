import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TimetableGeneratorService } from './algorithms/timetable-generator.service';
import { GenerateTimetableDto } from './dto/timetable.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';

@ApiTags('Timetable')
@Controller('timetable')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TimetableController {
  constructor(private readonly timetableService: TimetableGeneratorService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate automated timetable for all classes' })
  @Roles(UserRole.ADMIN)
  async generateTimetable(@Body() dto: GenerateTimetableDto) {
    const timetables = await this.timetableService.generateTimetable(
      dto.classRequirements,
      dto.teacherAvailabilities,
      dto.rooms,
    );

    // Validate the generated timetables
    const conflicts = this.timetableService.validateTimetable(timetables);

    // Optionally optimize if requested
    let optimizedTimetables = timetables;
    if (dto.optimize) {
      optimizedTimetables = timetables.map(t => 
        this.timetableService.optimizeTimetable(t)
      );
    }

    return {
      success: conflicts.filter(c => c.severity === 'ERROR').length === 0,
      timetables: optimizedTimetables,
      totalConflicts: conflicts.length,
      errors: conflicts.filter(c => c.severity === 'ERROR'),
      warnings: conflicts.filter(c => c.severity === 'WARNING'),
    };
  }

  @Get('validate')
  @ApiOperation({ summary: 'Validate existing timetable for conflicts' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async validateTimetable(@Param('termId') termId?: string) {
    // In production, fetch existing timetable from database
    // This is a placeholder for validation logic
    return {
      message: 'Validation endpoint - implement database integration',
      termId,
    };
  }

  @Get('class/:classId')
  @ApiOperation({ summary: 'Get timetable for specific class' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  async getClassTimetable(@Param('classId') classId: string) {
    // In production, fetch from database
    return {
      message: 'Get class timetable endpoint - implement database integration',
      classId,
    };
  }

  @Get('teacher/:teacherId')
  @ApiOperation({ summary: 'Get teaching schedule for specific teacher' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async getTeacherSchedule(@Param('teacherId') teacherId: string) {
    // In production, fetch from database
    return {
      message: 'Get teacher schedule endpoint - implement database integration',
      teacherId,
    };
  }

  @Get('room/:roomId')
  @ApiOperation({ summary: 'Get room allocation schedule' })
  @Roles(UserRole.ADMIN)
  async getRoomSchedule(@Param('roomId') roomId: string) {
    // In production, fetch from database
    return {
      message: 'Get room schedule endpoint - implement database integration',
      roomId,
    };
  }

  @Post('optimize/:timetableId')
  @ApiOperation({ summary: 'Optimize existing timetable' })
  @Roles(UserRole.ADMIN)
  async optimizeTimetable(@Param('timetableId') timetableId: string) {
    // In production, fetch timetable from database and optimize
    return {
      message: 'Optimize timetable endpoint - implement database integration',
      timetableId,
    };
  }
}
