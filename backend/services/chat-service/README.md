# Chat Service

Real-time Messaging Microservice for TokoBapak powered by Socket.io.

## Features

- **Real-time Chat**: WebSocket-based messaging
- **Room Management**: Join/leave chat rooms
- **Typing Indicators**: Real-time typing status
- **Message History**: In-memory message storage
- **Customer-Seller Chat**: Order-based conversations

## Tech Stack

- Node.js 20+
- NestJS 10
- Socket.io 4.x
- WebSocket Gateway

## WebSocket Events

### Client → Server

| Event | Payload | Description |
| ----- | ------- | ----------- |
| `join_room` | `{ roomId, userId, userName }` | Join a chat room |
| `leave_room` | `{ roomId, userName }` | Leave a chat room |
| `send_message` | `{ roomId, senderId, senderName, content }` | Send message |
| `typing` | `{ roomId, userName, isTyping }` | Typing indicator |
| `get_messages` | `{ roomId, limit }` | Get message history |

### Server → Client

| Event | Payload | Description |
| ----- | ------- | ----------- |
| `user_joined` | `{ userId, userName, roomId, timestamp }` | User joined room |
| `user_left` | `{ userName, roomId, timestamp }` | User left room |
| `new_message` | `{ id, roomId, senderId, senderName, content, timestamp }` | New message |
| `user_typing` | `{ roomId, userName, isTyping }` | Typing status |

## Running Locally

```bash
npm install
npm run start:dev
```

## Environment Variables

| Variable | Default | Description |
| -------- | ------- | ----------- |
| PORT | 3013 | Service port |
