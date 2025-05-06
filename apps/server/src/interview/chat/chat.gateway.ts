import { randomUUID } from 'node:crypto';

import { UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { WebSocketJwtGuard } from 'apps/server/authentication/guards/websocket-jwt.guard';
import { SocketUser } from 'apps/server/shared/decorators/socket-user.decorator';
import { JwtPayload } from 'apps/server/shared/decorators/user.decorator';
import { BaseGateway } from 'apps/server/shared/gateways/base.gateway';
import { httpHelper } from 'apps/server/shared/helpers/http.helper';
import { Socket } from 'socket.io';

import {
  ChatIncomingEvents,
  ChatOutgoingEvents,
} from './chat-events.constants';
import { SendNewMessageDto } from './dto/send-new-message.dto';

// transports: ['websocket'] is used to prevent the client from using polling. Polling is not supported by the Redis adapter.
@WebSocketGateway({
  namespace: 'chat',
  transports: ['websocket'],
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
@UseGuards(WebSocketJwtGuard)
export class ChatGateway extends BaseGateway {
  constructor(private readonly configService: ConfigService) {
    super(ChatGateway.name);
  }

  @SubscribeMessage(ChatIncomingEvents.SendMessage)
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @SocketUser() _user: JwtPayload,
    @MessageBody() payload: SendNewMessageDto,
  ): Promise<{
    id: string;
    status: 'pending' | 'success' | 'error';
  }> {
    const response = await httpHelper.stream(
      this.configService.getOrThrow<string>('app.llmOrigin'),
      {
        userInput: payload.userInput,
        interviewId: payload.interviewId,
      },
    );

    const uuid = randomUUID();
    let buffer = '';

    response.addListener('data', (chunk: Buffer) => {
      const chunkString = chunk.toString('utf8');
      if (!chunkString.trim()) return;

      buffer += chunkString;

      // Process complete SSE messages
      const messages = buffer.split('\n\n');
      buffer = messages.pop() || ''; // Keep the last incomplete message in the buffer

      for (const message of messages) {
        if (!message.trim()) continue;

        const lines = message.split('\n');
        const dataLine = lines.find((line) => line.startsWith('data: '));

        if (!dataLine) continue;

        const content = dataLine.slice(6);
        try {
          const contentPayload = JSON.parse(content) as { message: string };

          if (contentPayload.message) {
            client.emit(ChatOutgoingEvents.AssistantMessageChunk, {
              id: uuid,
              content: contentPayload.message,
              interviewId: payload.interviewId,
              createdAt: new Date(),
            });
          }
        } catch {
          this.logger.error('Error parsing content:', content);
        }
      }
    });

    return new Promise((resolve, reject) => {
      response.addListener('end', () => {
        resolve({
          id: uuid,
          status: 'success',
        });
      });

      response.addListener('error', (error) => {
        this.logger.error('Stream error:', error);
        reject(new Error('Failed to get response from LLM'));
      });
    });
  }
}
