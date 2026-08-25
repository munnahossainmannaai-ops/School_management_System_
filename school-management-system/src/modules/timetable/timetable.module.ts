import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimetableController } from './timetable.controller';
import { TimetableGeneratorService } from './algorithms/timetable-generator.service';
import { Class } from '../classes/entities/class.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Teacher } from '../staff/entities/teacher.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Class, Subject, Teacher]),
  ],
  controllers: [TimetableController],
  providers: [TimetableGeneratorService],
  exports: [TimetableGeneratorService],
})
export class TimetableModule {}
