import { Attachment, Interview } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NotificationsGatewayIncomingEvents {}

export interface NotificationsGatewayOutgoingEvents {
  'recording-thumbnail-status-update': ({
    recordingId,
  }: {
    recordingId: string;
    thumbnail: Pick<Attachment, 'url' | 'status'> & {
      interviewId: Interview['id'];
    };
  }) => void;
  'recording-video-status-update': ({
    recordingId,
  }: {
    recordingId: string;
    video: Pick<Attachment, 'url' | 'status'> & {
      interviewId: Interview['id'];
    };
  }) => void;
}
