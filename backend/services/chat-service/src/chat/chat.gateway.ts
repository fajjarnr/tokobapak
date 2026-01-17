import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

interface ChatMessage {
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp?: string;
}

interface JoinRoomPayload {
  roomId: string;
  userId: string;
  userName: string;
}

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.chatService.removeClient(client.id);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    const { roomId, userId, userName } = payload;
    
    client.join(roomId);
    this.chatService.addClient(client.id, userId, roomId);
    
    this.logger.log(`${userName} joined room ${roomId}`);
    
    // Notify others in room
    client.to(roomId).emit('user_joined', {
      userId,
      userName,
      roomId,
      timestamp: new Date().toISOString(),
    });

    return { success: true, roomId };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; userName: string },
  ) {
    const { roomId, userName } = payload;
    
    client.leave(roomId);
    this.chatService.removeClient(client.id);
    
    client.to(roomId).emit('user_left', {
      userName,
      roomId,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  @SubscribeMessage('send_message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: ChatMessage,
  ) {
    const enrichedMessage = {
      ...message,
      timestamp: new Date().toISOString(),
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Store message
    this.chatService.storeMessage(enrichedMessage);

    // Broadcast to room
    this.server.to(message.roomId).emit('new_message', enrichedMessage);

    return { success: true, messageId: enrichedMessage.id };
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; userName: string; isTyping: boolean },
  ) {
    client.to(payload.roomId).emit('user_typing', payload);
  }

  @SubscribeMessage('get_messages')
  async handleGetMessages(@MessageBody() payload: { roomId: string; limit?: number }) {
    const messages = await this.chatService.getMessages(payload.roomId, payload.limit || 50);
    return { messages };
  }
}
