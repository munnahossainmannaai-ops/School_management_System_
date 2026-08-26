import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoConferencingController } from './controllers/video-conferencing.controller';
import { VideoConferencingService } from './services/video-conferencing.service';
import { VideoSession } from './entities/video-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VideoSession])],
  controllers: [VideoConferencingController],
  providers: [VideoConferencingService],
  exports: [VideoConferencingService],
})
export class VideoConferencingModule {}
