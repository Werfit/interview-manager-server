import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export class BaseGateway implements OnGatewayConnection, OnGatewayDisconnect {
  protected readonly logger: Logger;

  constructor(loggerName: string) {
    this.logger = new Logger(loggerName);
  }

  handleConnection(client: Socket) {
    this.logger.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Client disconnected:', client.id);
  }
}
