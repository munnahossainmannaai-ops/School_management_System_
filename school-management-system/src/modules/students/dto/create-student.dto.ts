import { IsNotEmpty, IsOptional, IsEmail, IsDateString, IsEnum } from 'class-validator';
import { Student } from '../../../database/entities/user.entity';

export class CreateStudentDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  admissionNumber: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsOptional()
  gender?: string;

  @IsOptional()
  bloodGroup?: string;

  @IsOptional()
  religion?: string;

  @IsOptional()
  caste?: string;

  @IsOptional()
  nationality?: string;

  @IsOptional()
  motherTongue?: string;

  @IsOptional()
  parentId?: string;

  @IsOptional()
  currentClassId?: string;

  @IsOptional()
  currentSectionId?: string;

  @IsDateString()
  @IsNotEmpty()
  admissionDate: string;

  @IsOptional()
  previousSchool?: string;

  @IsOptional()
  remarks?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  state?: string;

  @IsOptional()
  zipCode?: string;
}

export class UpdateStudentDto {
  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  password?: string;

  @IsOptional()
  admissionNumber?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsOptional()
  gender?: string;

  @IsOptional()
  bloodGroup?: string;

  @IsOptional()
  religion?: string;

  @IsOptional()
  caste?: string;

  @IsOptional()
  nationality?: string;

  @IsOptional()
  motherTongue?: string;

  @IsOptional()
  parentId?: string;

  @IsOptional()
  currentClassId?: string;

  @IsOptional()
  currentSectionId?: string;

  @IsDateString()
  @IsOptional()
  admissionDate?: string;

  @IsOptional()
  previousSchool?: string;

  @IsOptional()
  remarks?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  state?: string;

  @IsOptional()
  zipCode?: string;

  @IsOptional()
  status?: 'active' | 'inactive' | 'suspended';
}

export class StudentQueryDto {
  @IsOptional()
  classId?: string;

  @IsOptional()
  sectionId?: string;

  @IsOptional()
  parentId?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  search?: string;

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;
}
