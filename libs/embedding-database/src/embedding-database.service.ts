import { Injectable, Logger } from '@nestjs/common';
import {
  AddRecordsParams,
  ChromaClient,
  Collection,
  DeleteParams,
  IncludeEnum,
  QueryRecordsParams,
} from 'chromadb';
import { tryCatch } from 'utilities/try-catch/try-catch.utility';

type ChromaOptions = {
  url: string;
  collection: string;
};

@Injectable()
export class EmbeddingDatabaseService {
  private readonly logger = new Logger(EmbeddingDatabaseService.name);
  private readonly client: ChromaClient;
  private collection: Collection;

  constructor(private readonly options: ChromaOptions) {
    this.client = new ChromaClient({
      path: options.url,
    });
  }

  private async getOrCreateCollection() {
    this.logger.log(
      `ChromaService::getOrCreateCollection:${this.options.collection}`,
    );
    if (this.collection) {
      return this.collection;
    }

    this.collection = await this.client.getOrCreateCollection({
      name: this.options.collection,
    });

    return this.collection;
  }

  async addEmbeddings(recordParameters: AddRecordsParams) {
    const collection = await this.getOrCreateCollection();
    this.logger.log(
      `ChromaService::addEmbeddings:${recordParameters.ids.length}`,
    );

    const [success, error] = await tryCatch(async () => {
      await collection.add(recordParameters);

      // Verify the documents were added
      const addedDocuments = await collection.get({
        ids: recordParameters.ids,
        include: [IncludeEnum.Documents, IncludeEnum.Metadatas],
      });

      return addedDocuments;
    });

    if (!success) {
      this.logger.error('Failed to add embeddings:', error);
      throw error;
    }

    return success;
  }

  async queryEmbeddings(queryParameters: QueryRecordsParams) {
    const collection = await this.getOrCreateCollection();

    this.logger.log(
      `ChromaService::queryEmbeddings:${queryParameters.nResults}`,
    );

    const [success, data] = await tryCatch(async () => {
      const result = await collection.query(queryParameters);
      this.logger.debug('Query result:', result);
      return result;
    });

    if (!success) {
      this.logger.error('Failed to query embeddings:', data);
      throw data;
    }

    return data;
  }

  async deleteEmbeddings(queryParameters: DeleteParams) {
    const collection = await this.getOrCreateCollection();

    this.logger.log(`ChromaService::deleteEmbeddings`);

    const [success, data] = await tryCatch(async () => {
      const result = await collection.delete(queryParameters);
      this.logger.debug('Query result:', result);
      return result;
    });

    if (!success) {
      this.logger.error('Failed to query embeddings:', data);
      throw data;
    }

    return data;
  }
}
