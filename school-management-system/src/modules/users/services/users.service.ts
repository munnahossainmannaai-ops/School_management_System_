import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus, Student, Staff } from '../../database/entities/user.entity';
import { CreateUserDto, UpdateUserDto, FilterUsersDto } from '../dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
      withDeleted: true,
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findAll(filterDto: FilterUsersDto): Promise<{ data: User[]; total: number }> {
    const { page = 1, limit = 10, search, role, status, sortBy = 'createdAt', order = 'DESC' } = filterDto;

    const where: any = {};

    if (search) {
      where.firstName = Like(`%${search}%`);
      where.lastName = Like(`%${search}%`);
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await this.userRepository.findAndCount({
      where,
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'status', 'phone', 'profilePicture', 'createdAt'],
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: order === 'ASC' ? 'ASC' : 'DESC' },
      withDeleted: false,
    });

    return { data, total };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['students', 'staff'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.softDelete(id);
  }

  async restore(id: string): Promise<void> {
    await this.userRepository.restore(id);
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { userId },
      select: ['password'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
  }

  // Student-specific methods
  async createStudentProfile(studentData: Partial<Student>): Promise<Student> {
    return this.studentRepository.save(studentData);
  }

  async getStudentByUserId(userId: string): Promise<Student | null> {
    return this.studentRepository.findOne({ where: { userId } });
  }

  // Staff-specific methods
  async createStaffProfile(staffData: Partial<Staff>): Promise<Staff> {
    return this.staffRepository.save(staffData);
  }

  async getStaffByUserId(userId: string): Promise<Staff | null> {
    return this.staffRepository.findOne({ where: { userId } });
  }

  async getUserStatistics(): Promise<any> {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ where: { status: UserStatus.ACTIVE } });
    const inactiveUsers = await this.userRepository.count({ where: { status: UserStatus.INACTIVE } });
    
    const usersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(user.id)', 'count')
      .groupBy('user.role')
      .getRawMany();

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      byRole: usersByRole,
    };
  }
}
