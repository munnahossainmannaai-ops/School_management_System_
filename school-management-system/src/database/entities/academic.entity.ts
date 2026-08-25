import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';

@Entity('academic_classes')
export class AcademicClass {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  name: string; // e.g., "Class 1", "Class 10"

  @Column({ type: 'varchar', length: 10, nullable: true })
  shortName?: string; // e.g., "1", "10"

  @Column({ type: 'int', default: 1 })
  sortOrder: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'uuid', nullable: true })
  classTeacherId?: string;

  @OneToMany(() => Section, (section) => section.academicClass)
  sections: Section[];

  @OneToMany(() => Subject, (subject) => subject.academicClass)
  subjects: Subject[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}

@Entity('sections')
@Unique(['name', 'academicClassId'])
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  name: string; // e.g., "A", "B", "Red"

  @ManyToOne(() => AcademicClass, (academicClass) => academicClass.sections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'academicClassId' })
  academicClass: AcademicClass;

  @Column({ name: 'academicClassId', type: 'uuid' })
  academicClassId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  roomNumber?: string;

  @Column({ type: 'int', default: 30 })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  currentStrength: number;

  @Column({ type: 'uuid', nullable: true })
  classTeacherId?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}

@Entity('subjects')
@Unique(['code', 'academicClassId'])
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string; // e.g., "Mathematics", "Science"

  @Column({ type: 'varchar', length: 20, unique: false })
  code: string; // e.g., "MATH101", "SCI201"

  @ManyToOne(() => AcademicClass, (academicClass) => academicClass.subjects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'academicClassId' })
  academicClass: AcademicClass;

  @Column({ name: 'academicClassId', type: 'uuid' })
  academicClassId: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', default: 100 })
  totalMarks: number;

  @Column({ type: 'int', default: 40 })
  passingMarks: number;

  @Column({ type: 'int', default: 0 })
  theoryMarks: number;

  @Column({ type: 'int', default: 0 })
  practicalMarks: number;

  @Column({ type: 'uuid', nullable: true })
  teacherId?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}

@Entity('academic_sessions')
export class AcademicSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  name: string; // e.g., "2024-2025"

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'boolean', default: false })
  isCurrent: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}

@Entity('terms')
export class Term {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string; // e.g., "First Term", "Half Yearly"

  @ManyToOne(() => AcademicSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: AcademicSession;

  @Column({ name: 'sessionId', type: 'uuid' })
  sessionId: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'boolean', default: false })
  isCurrent: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
