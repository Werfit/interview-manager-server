import { Injectable } from '@nestjs/common';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Participant, User } from '@prisma/client';

import { GetMessagesDto } from './dto/get-messages.dto';
import { SendNewMessageDto } from './dto/send-new-message.dto';
@Injectable()
export class ChatService {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async createChat(interviewId: string) {
    const chat = await this.txHost.tx.chat.create({
      data: {
        interviewId,
      },
    });

    return chat;
  }

  async getMessages({
    interviewId,
    userId,
  }: GetMessagesDto & {
    userId: User['id'];
  }) {
    const messages = await this.txHost.tx.message.findMany({
      where: {
        chatId: interviewId,
        sender: {
          userId,
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            type: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return messages;
  }

  @Transactional()
  async sendMessage({
    interviewId,
    userInput,
    senderId,
  }: SendNewMessageDto & {
    senderId: Participant['id'];
  }) {
    const chat = await this.txHost.tx.chat.findUnique({
      where: {
        interviewId: interviewId,
        participants: {
          some: {
            id: senderId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!chat) {
      return null;
    }

    const message = await this.txHost.tx.message.create({
      data: {
        chatId: chat.id,
        content: userInput,
        senderId,
      },
    });

    return message;
  }
}
