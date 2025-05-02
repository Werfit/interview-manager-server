import { randomUUID } from 'node:crypto';

import { UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Message } from '@prisma/client';
import { Socket } from 'socket.io';
import { WebSocketJwtGuard } from 'src/authentication/guards/websocket-jwt.guard';
import { SocketUser } from 'src/shared/decorators/socket-user.decorator';
import { JwtPayload } from 'src/shared/decorators/user.decorator';
import { BaseGateway } from 'src/shared/gateways/base.gateway';
import { httpHelper } from 'src/shared/helpers/http.helper';

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
  ): Promise<
    Pick<Message, 'id'> & {
      status: 'pending' | 'success' | 'error';
    }
  > {
    const response = await httpHelper.stream(
      this.configService.getOrThrow<string>('app.llmOrigin'),
      {
        userInput: payload.userInput,
        interviewId: payload.interviewId,
      },
    );

    const uuid = randomUUID();

    response.addListener('data', (chunk: Buffer) => {
      const chunkString = chunk.toString('utf8');
      if (!chunkString.trim()) return;

      // Process each line in the chunk
      const lines = chunkString.split('\n');
      for (const line of lines) {
        if (!line.startsWith('data: ')) {
          continue;
        }

        const content = line.slice(6);

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

      response.addListener('error', () => {
        reject(new Error('Failed to get response from LLM'));
      });
    });
  }
}
