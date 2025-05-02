import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Server, ServerOptions } from 'socket.io';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({
      url: this.configService.getOrThrow<string>('redis.url'),
    });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(_: number, options?: ServerOptions): any {
    const port = this.configService.getOrThrow<number>('socket.port');
    const server = super.createIOServer(port, options) as Server;
    server.adapter(this.adapterConstructor);
    return server;
  }
}
