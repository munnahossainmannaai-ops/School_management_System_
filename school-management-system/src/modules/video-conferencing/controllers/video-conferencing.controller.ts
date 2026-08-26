import { Controller, Get, Post, Param, Body, UseGuards, Delete } from '@nestjs/common';
import { VideoConferencingService } from './services/video-conferencing.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../database/entities/user.entity';

@Controller('api/video')
@UseGuards(JwtAuthGuard)
export class VideoConferencingController {
  constructor(private readonly videoService: VideoConferencingService) {}

  @Post('sessions')
  async createSession(
    @Body() body: { roomName: string; scheduledAt: Date; durationMinutes?: number; description?: string },
    @CurrentUser() user: User,
  ) {
    return this.videoService.createSession(
      user,
      body.roomName,
      new Date(body.scheduledAt),
      body.durationMinutes,
      body.description,
    );
  }

  @Get('sessions/:id')
  async getSession(@Param('id') sessionId: string) {
    return this.videoService.getSession(sessionId);
  }

  @Post('sessions/:id/join')
  async joinSession(@Param('id') sessionId: string, @CurrentUser() user: User) {
    return this.videoService.joinSession(sessionId, user);
  }

  @Post('sessions/:id/end')
  async endSession(@Param('id') sessionId: string) {
    return this.videoService.endSession(sessionId);
  }

  @Get('sessions/upcoming')
  async getUpcomingSessions(@CurrentUser() user: User) {
    return this.videoService.getUpcomingSessions(user.id);
  }

  @Get('sessions/active')
  async getActiveSessions() {
    return this.videoService.getActiveSessions();
  }

  @Post('sessions/:id/recording')
  async saveRecording(
    @Param('id') sessionId: string,
    @Body() recordingData: { url: string; duration: number; size: number },
  ) {
    return this.videoService.saveRecording(sessionId, recordingData);
  }

  @Get('webrtc-config')
  async getWebRTCConfig() {
    return this.videoService.getWebRTCConfig();
  }
}
