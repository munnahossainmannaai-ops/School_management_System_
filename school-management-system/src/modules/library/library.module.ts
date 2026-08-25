import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book, BookIssue, BookReservation, LibraryFine } from '../../database/entities/library.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, BookIssue, BookReservation, LibraryFine])],
  exports: [],
})
export class LibraryModule {}
