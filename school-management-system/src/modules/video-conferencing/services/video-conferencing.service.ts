import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoSession } from './entities/video-session.entity';
import { User } from '../../../database/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VideoConferencingService {
  private readonly logger = new Logger(VideoConferencingService.name);
  private readonly webrtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  constructor(
    @InjectRepository(VideoSession)
    private videoSessionRepo: Repository<VideoSession>,
  ) {}

  async createSession(
    host: User,
    roomName: string,
    scheduledAt: Date,
    durationMinutes: number = 60,
    description?: string,
  ): Promise<VideoSession> {
    const sessionId = uuidv4();
    const meetingUrl = `${process.env.FRONTEND_URL}/video/${sessionId}`;
    const password = this.generateMeetingPassword();

    const session = this.videoSessionRepo.create({
      sessionId,
      roomName,
      meetingUrl,
      password,
      host,
      participants: [],
      status: 'scheduled',
      scheduledAt,
      durationMinutes,
      description,
    });

    this.logger.log(`Video session created: ${sessionId} for ${roomName}`);
    return this.videoSessionRepo.save(session);
  }

  async joinSession(sessionId: string, user: User): Promise<VideoSession> {
    const session = await this.videoSessionRepo.findOne({
      where: { sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status === 'ended' || session.status === 'cancelled') {
      throw new Error('Session is no longer active');
    }

    if (!session.participants.includes(user.id)) {
      session.participants.push(user.id);
      await this.videoSessionRepo.save(session);
    }

    if (session.status === 'scheduled') {
      session.status = 'active';
      await this.videoSessionRepo.save(session);
    }

    return session;
  }

  async endSession(sessionId: string): Promise<VideoSession> {
    const session = await this.videoSessionRepo.findOne({
      where: { sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'ended';
    session.endedAt = new Date();
    return this.videoSessionRepo.save(session);
  }

  async getSession(sessionId: string): Promise<VideoSession> {
    const session = await this.videoSessionRepo.findOne({
      where: { sessionId },
      relations: ['host'],
    });

    if (!session) {
      throw new Error('Session not found');
    }

    return session;
  }

  async getUpcomingSessions(userId: string): Promise<VideoSession[]> {
    const now = new Date();
    return this.videoSessionRepo.find({
      where: [
        { host: { id: userId }, scheduledAt: { $gte: now }, status: 'scheduled' },
        { participants: () => `participants @> '["${userId}"]'`, scheduledAt: { $gte: now }, status: 'scheduled' },
      ],
      order: { scheduledAt: 'ASC' },
      relations: ['host'],
    });
  }

  async getActiveSessions(): Promise<VideoSession[]> {
    return this.videoSessionRepo.find({
      where: { status: 'active' },
      relations: ['host'],
    });
  }

  async saveRecording(
    sessionId: string,
    recordingData: { url: string; duration: number; size: number },
  ): Promise<VideoSession> {
    const session = await this.videoSessionRepo.findOne({ where: { sessionId } });
    
    if (!session) {
      throw new Error('Session not found');
    }

    session.recording = recordingData;
    return this.videoSessionRepo.save(session);
  }

  private generateMeetingPassword(): string {
    return Math.random().toString(36).slice(-8);
  }

  getWebRTCConfig() {
    return this.webrtcConfig;
  }
}
