import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from '../../database/entities/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
      withDeleted: true,
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = this.userRepository.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role || UserRole.STUDENT,
      phone: registerDto.phone,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const token = this.generateToken(savedUser);

    return { user: savedUser, token };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    // Find user with password
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      select: ['id', 'firstName', 'lastName', 'email', 'password', 'role', 'status', 'phone', 'profilePicture'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check user status
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Update last login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // Generate JWT token
    const token = this.generateToken(user);

    return { user, token };
  }

  async validateUser(userId: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'status', 'phone', 'profilePicture'],
    });

    if (user && user.status === UserStatus.ACTIVE) {
      return user;
    }

    return null;
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  async refreshToken(token: string): Promise<{ token: string }> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.validateUser(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found or inactive');
      }

      const newToken = this.generateToken(user);
      return { token: newToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
