import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Student, User, UserRole, UserStatus } from '../../../database/entities/user.entity';
import { CreateStudentDto, UpdateStudentDto, StudentQueryDto } from '../dto/create-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    // Check if admission number already exists
    const existingStudent = await this.studentRepository.findOne({
      where: { admissionNumber: createStudentDto.admissionNumber },
    });

    if (existingStudent) {
      throw new ConflictException('Admission number already exists');
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createStudentDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createStudentDto.password, 10);

    // Create user first
    const user = this.userRepository.create({
      firstName: createStudentDto.firstName,
      lastName: createStudentDto.lastName,
      email: createStudentDto.email,
      password: hashedPassword,
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      phone: createStudentDto.phone,
      address: createStudentDto.address,
      city: createStudentDto.city,
      state: createStudentDto.state,
      zipCode: createStudentDto.zipCode,
    });

    const savedUser = await this.userRepository.save(user);

    // Create student record
    const student = this.studentRepository.create({
      ...createStudentDto,
      userId: savedUser.id,
      dateOfBirth: createStudentDto.dateOfBirth ? new Date(createStudentDto.dateOfBirth) : null,
      admissionDate: new Date(createStudentDto.admissionDate),
    });

    return await this.studentRepository.save(student);
  }

  async findAll(query: StudentQueryDto) {
    const { classId, sectionId, parentId, status, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const whereConditions: any = {};

    if (classId) whereConditions.currentClassId = classId;
    if (sectionId) whereConditions.currentSectionId = sectionId;
    if (parentId) whereConditions.parentId = parentId;

    const queryBuilder = this.studentRepository.createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .where(whereConditions);

    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR student.admissionNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    const [students, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('student.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data: students,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);

    // Update user details if provided
    if (
      updateStudentDto.firstName ||
      updateStudentDto.lastName ||
      updateStudentDto.email ||
      updateStudentDto.password ||
      updateStudentDto.phone ||
      updateStudentDto.address ||
      updateStudentDto.city ||
      updateStudentDto.state ||
      updateStudentDto.zipCode ||
      updateStudentDto.status
    ) {
      const userData: any = {};
      if (updateStudentDto.firstName) userData.firstName = updateStudentDto.firstName;
      if (updateStudentDto.lastName) userData.lastName = updateStudentDto.lastName;
      if (updateStudentDto.email) userData.email = updateStudentDto.email;
      if (updateStudentDto.phone !== undefined) userData.phone = updateStudentDto.phone;
      if (updateStudentDto.address !== undefined) userData.address = updateStudentDto.address;
      if (updateStudentDto.city !== undefined) userData.city = updateStudentDto.city;
      if (updateStudentDto.state !== undefined) userData.state = updateStudentDto.state;
      if (updateStudentDto.zipCode !== undefined) userData.zipCode = updateStudentDto.zipCode;
      if (updateStudentDto.status) userData.status = updateStudentDto.status;

      if (updateStudentDto.password) {
        userData.password = await bcrypt.hash(updateStudentDto.password, 10);
      }

      await this.userRepository.update(student.userId, userData);
    }

    // Update student details
    const studentData: any = { ...updateStudentDto };
    if (updateStudentDto.dateOfBirth) {
      studentData.dateOfBirth = new Date(updateStudentDto.dateOfBirth);
    }
    if (updateStudentDto.admissionDate) {
      studentData.admissionDate = new Date(updateStudentDto.admissionDate);
    }

    delete studentData.firstName;
    delete studentData.lastName;
    delete studentData.email;
    delete studentData.password;
    delete studentData.phone;
    delete studentData.address;
    delete studentData.city;
    delete studentData.state;
    delete studentData.zipCode;
    delete studentData.status;

    await this.studentRepository.update(id, studentData);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const student = await this.findOne(id);
    await this.studentRepository.remove(student);
  }

  async findByUserId(userId: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!student) {
      throw new NotFoundException('Student record not found for this user');
    }

    return student;
  }

  async getStatistics() {
    const totalStudents = await this.studentRepository.count();
    
    const activeStudents = await this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .where('user.status = :status', { status: UserStatus.ACTIVE })
      .getCount();

    const inactiveStudents = await this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .where('user.status = :status', { status: UserStatus.INACTIVE })
      .getCount();

    const studentsByClass = await this.studentRepository
      .createQueryBuilder('student')
      .select('student.currentClassId', 'classId')
      .addSelect('COUNT(student.id)', 'count')
      .groupBy('student.currentClassId')
      .getRawMany();

    return {
      totalStudents,
      activeStudents,
      inactiveStudents,
      studentsByClass,
    };
  }
}
