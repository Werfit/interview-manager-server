import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Attachment, Interview, InterviewRecording } from '@prisma/client';
import { Server } from 'socket.io';

import { BaseGateway } from '../shared/gateways/base.gateway';
import { NotificationsGatewayOutgoingEvents } from './notifications.interface';
import { NotificationsGatewayIncomingEvents } from './notifications.interface';

@WebSocketGateway({
  namespace: 'notifications',
})
export class NotificationsGateway extends BaseGateway {
  constructor() {
    super(NotificationsGateway.name);
  }

  @WebSocketServer()
  server: Server<
    NotificationsGatewayIncomingEvents,
    NotificationsGatewayOutgoingEvents
  >;

  notifyRecordingThumbnailStatusUpdate(
    recordingId: InterviewRecording['id'],
    thumbnail: Pick<Attachment, 'url' | 'status'> & {
      interviewId: Interview['id'];
    },
  ) {
    this.logger.log(
      `NotificationsGateway::notifyRecordingThumbnailStatusUpdate`,
    );
    this.server.emit('recording-thumbnail-status-update', {
      recordingId,
      thumbnail,
    });
  }

  notifyRecordingVideoStatusUpdate(
    recordingId: InterviewRecording['id'],
    video: Pick<Attachment, 'url' | 'status'> & {
      interviewId: Interview['id'];
    },
  ) {
    this.logger.log(`NotificationsGateway::notifyRecordingVideoStatusUpdate`);
    this.server.emit('recording-video-status-update', {
      recordingId,
      video,
    });
  }
}
