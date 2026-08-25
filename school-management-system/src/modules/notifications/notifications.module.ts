import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification, UserNotification, NotificationTemplate, Announcement } from '../../database/entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, UserNotification, NotificationTemplate, Announcement])],
  exports: [],
})
export class NotificationsModule {}
