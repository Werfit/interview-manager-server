import {
  Attachment,
  AttachmentStatus,
  AttachmentType,
  Candidate,
  Interview,
} from '@prisma/client';

type FindPDFAttachmentData = {
  where: Partial<{
    id: Attachment['id'];
    candidateId: Candidate['id'];
    interviewId: Interview['id'];
  }>;
  type: typeof AttachmentType.PDF;
};

type FindVideoAttachmentData = {
  where: Pick<Attachment, 'id'>;
  type: typeof AttachmentType.VIDEO;
};

export type FindAttachmentData =
  | FindPDFAttachmentData
  | FindVideoAttachmentData;

export type CreateVideoAttachmentData = {
  create: {
    interviewId: Interview['id'];
    url: Attachment['url'];
    status?: AttachmentStatus;
  };
  type: typeof AttachmentType.VIDEO;
};

export type CreatePDFAttachmentData = {
  create: Pick<Attachment, 'url' | 'status' | 'candidateId'>;
  type: typeof AttachmentType.PDF;
};

export type CreateThumbnailAttachmentData = {
  create: Pick<Attachment, 'url' | 'status'> & {
    videoId?: string;
  };
  type: typeof AttachmentType.IMAGE;
};

export type CreateAttachmentData =
  | CreatePDFAttachmentData
  | CreateThumbnailAttachmentData
  | CreateVideoAttachmentData;

export type UpdateVideoAttachmentData = {
  id: Attachment['id'];
  update: Partial<Pick<Attachment, 'url' | 'status' | 'interviewId'>>;
  type: typeof AttachmentType.VIDEO;
};

export type UpdateAttachmentData = UpdateVideoAttachmentData;
