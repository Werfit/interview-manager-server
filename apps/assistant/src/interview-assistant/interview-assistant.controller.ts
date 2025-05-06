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
import { map, mergeMap } from 'rxjs/operators';

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
  ask(@Body() body: AskDto): Observable<MessageEvent> {
    this.logger.log(`InterviewAssistantController::ask:${body.userInput}`);
    return from(this.processAsk(body)).pipe(mergeMap((obs) => obs));
  }

  private async processAsk(body: AskDto): Promise<Observable<MessageEvent>> {
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

    console.log(context);
    const response = await this.interviewAssistantService.ask({
      content: context,
      question: body.userInput,
    });

    return from(response).pipe(
      map(
        (chunk) =>
          ({
            data: JSON.stringify({ message: chunk.response }),
          }) satisfies MessageEvent,
      ),
    );
  }
}
