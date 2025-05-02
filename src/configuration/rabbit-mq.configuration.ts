import { registerAs } from '@nestjs/config';

export default registerAs('rabbit-mq', () => {
  const url = `amqp://${process.env.RABBIT_MQ_USER}:${process.env.RABBIT_MQ_PASSWORD}@${process.env.RABBIT_MQ_HOST}:${process.env.RABBIT_MQ_PORT}`;

  return {
    url,
    queue: process.env.RABBIT_MQ_QUEUE,
    responseQueue: `${process.env.RABBIT_MQ_QUEUE}_response`,
  };
});
