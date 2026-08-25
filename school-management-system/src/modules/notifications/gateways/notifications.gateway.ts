import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map(); // socketId -> userId

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('join')
  @UseGuards(JwtAuthGuard)
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; roles: string[] },
  ) {
    this.connectedUsers.set(client.id, data.userId);
    
    // Join role-based rooms
    data.roles.forEach(role => {
      client.join(`role:${role}`);
    });
    
    // Join user-specific room
    client.join(`user:${data.userId}`);
    
    return { event: 'joined', data: { userId: data.userId, roles: data.roles } };
  }

  @SubscribeMessage('leave')
  handleLeave(@ConnectedSocket() client: Socket) {
    client.rooms.forEach(room => {
      client.leave(room);
    });
    this.connectedUsers.delete(client.id);
    return { event: 'left', data: { socketId: client.id } };
  }

  // Send notification to specific user
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Send notification to all users with specific role
  sendToRole(role: string, event: string, data: any) {
    this.server.to(`role:${role}`).emit(event, data);
  }

  // Send notification to all connected clients
  sendToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Send notification to multiple users
  sendToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach(userId => {
      this.sendToUser(userId, event, data);
    });
  }
}
