import {
  Body,
  Controller,
  Logger,
  MessageEvent,
  Post,
  Sse,
} from '@nestjs/common';
import { EmbeddingService } from 'libs/embedding/embedding.service';
import { EmbeddingDatabaseService } from 'libs/embedding-database';
import { from, Observable } from 'rxjs';

import { AskDto } from './dto/ask.dto';
import { InterviewAssistantService } from './interview-assistant.service';

@Controller('interview-assistant')
export class InterviewAssistantController {
  private readonly logger = new Logger(InterviewAssistantController.name);

  constructor(
    private readonly interviewAssistantService: InterviewAssistantService,
    private readonly embeddingService: EmbeddingService,
    private readonly databaseService: EmbeddingDatabaseService,
  ) {}

  @Post('ask')
  @Sse()
  async ask(@Body() body: AskDto): Promise<Observable<MessageEvent>> {
    this.logger.log(`InterviewAssistantController::ask:${body.userInput}`);
    const embedding = await this.embeddingService.embedText([body.userInput]);

    const relevantDocuments = await this.databaseService.queryEmbeddings({
      queryEmbeddings: embedding,
      nResults: 10,
      where: {
        interviewId: body.interviewId,
      },
    });

    if (
      !relevantDocuments.documents ||
      relevantDocuments.documents.every((document) => document.length === 0)
    ) {
      return from([
        {
          data: JSON.stringify({
            message: 'No information regarding the interview is found',
          }),
        } satisfies MessageEvent,
      ]);
    }

    const context = relevantDocuments.documents
      .map((document) =>
        document.filter((document) => document !== null).join('\n'),
      )
      .join('\n');

    return new Observable<MessageEvent>((subscriber) => {
      const run = async () => {
        try {
          const { textStream } = this.interviewAssistantService.ask({
            content: context,
            question: body.userInput,
          });

          for await (const chunk of textStream) {
            subscriber.next({ data: chunk });
          }

          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      };

      run();
    });
  }
}
