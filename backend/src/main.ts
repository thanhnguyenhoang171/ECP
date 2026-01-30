import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'ECP_PROJECT',
    }),
  });

  const logger = new Logger('BOOTSTRAP');
  const port = process.env.PORT ?? 3000;

  await app.listen(port);

  logger.log(`ECP_PROJECT is running on http://localhost:${port}`);
}
bootstrap();
