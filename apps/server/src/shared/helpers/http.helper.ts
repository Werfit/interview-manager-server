import { Readable } from 'node:stream';

import axios from 'axios';

export class HttpHelper {
  async stream(url: string, body: any): Promise<Readable> {
    const response = await axios.post(url, body, {
      responseType: 'stream',
      headers: {
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });

    const stream = response.data as Readable;
    stream.setEncoding('utf8');

    return stream;
  }
}

export const httpHelper = new HttpHelper();
