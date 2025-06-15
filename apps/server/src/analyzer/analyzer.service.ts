import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class AnalyzerService {
  private readonly logger = new Logger(AnalyzerService.name);
  constructor(private readonly options: { url: string }) {}

  getAssistance(content: string, interviewId: string) {
    this.logger.log(`AnalyzerService::getAssistance:${content.length}`);

    return new Observable<string>((subscriber) => {
      const response = axios.post(
        `${this.options.url}/api/v1/assistant`,
        {
          userInput: content,
          interviewId,
        },
        {
          responseType: 'stream',
        },
      );

      response
        .then((response: AxiosResponse) => {
          const stream = response.data as NodeJS.ReadableStream;

          stream.on('data', (chunk: Buffer) => {
            subscriber.next(chunk.toString());
          });

          stream.on('end', () => {
            subscriber.complete();
          });

          stream.on('error', (error: Error) => {
            subscriber.error(error);
          });
        })
        .catch((error) => {
          subscriber.error(error);
        });
    });
  }
}
