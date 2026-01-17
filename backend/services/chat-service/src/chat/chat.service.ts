import { Injectable, Logger } from '@nestjs/common';

interface StoredMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

interface ConnectedClient {
  socketId: string;
  userId: string;
  roomId: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private clients: Map<string, ConnectedClient> = new Map();
  private messages: Map<string, StoredMessage[]> = new Map(); // In-memory for now

  addClient(socketId: string, userId: string, roomId: string): void {
    this.clients.set(socketId, { socketId, userId, roomId });
    this.logger.log(`Added client ${socketId} for user ${userId} in room ${roomId}`);
  }

  removeClient(socketId: string): void {
    const client = this.clients.get(socketId);
    if (client) {
      this.clients.delete(socketId);
      this.logger.log(`Removed client ${socketId}`);
    }
  }

  getClientsInRoom(roomId: string): ConnectedClient[] {
    return Array.from(this.clients.values()).filter((c) => c.roomId === roomId);
  }

  storeMessage(message: StoredMessage): void {
    const roomMessages = this.messages.get(message.roomId) || [];
    roomMessages.push(message);
    
    // Keep only last 1000 messages per room
    if (roomMessages.length > 1000) {
      roomMessages.shift();
    }
    
    this.messages.set(message.roomId, roomMessages);
  }

  async getMessages(roomId: string, limit: number): Promise<StoredMessage[]> {
    const roomMessages = this.messages.get(roomId) || [];
    return roomMessages.slice(-limit);
  }

  generateConversationRoomId(userId1: string, userId2: string): string {
    // Ensure consistent room ID regardless of order
    const sorted = [userId1, userId2].sort();
    return `conv_${sorted[0]}_${sorted[1]}`;
  }

  generateOrderChatRoomId(orderId: string): string {
    return `order_${orderId}`;
  }
}
