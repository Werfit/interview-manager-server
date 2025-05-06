import { Injectable, Logger } from '@nestjs/common';
import {
  AddRecordsParams,
  ChromaClient,
  Collection,
  QueryRecordsParams,
} from 'chromadb';

type ChromaOptions = {
  url: string;
  collection: string;
};

@Injectable()
export class EmbeddingDatabaseService {
  private readonly logger = new Logger(EmbeddingDatabaseService.name);
  private readonly client: ChromaClient;

  constructor(options: ChromaOptions) {
    this.client = new ChromaClient({
      path: options.url,
    });
  }

  async getOrCreateCollection(name: string) {
    this.logger.log(`ChromaService::getOrCreateCollection:${name}`);
    return this.client.getOrCreateCollection({
      name,
    });
  }

  async addEmbeddings(
    collection: Collection,
    recordParameters: AddRecordsParams,
  ) {
    this.logger.log(
      `ChromaService::addEmbeddings:${recordParameters.ids.length}`,
    );
    return collection.add(recordParameters);
  }

  async queryEmbeddings(
    collection: Collection,
    queryParameters: QueryRecordsParams,
  ) {
    this.logger.log(
      `ChromaService::queryEmbeddings:${queryParameters.nResults}`,
    );
    return collection.query(queryParameters);
  }
}
