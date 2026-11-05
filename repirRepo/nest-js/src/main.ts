import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

// Corrige a serialização global do BigInt para JSON
(BigInt.prototype as any).toJSON = function () {
  return Number(this); // Converte BigInt para número comum ao serializar para JSON
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita o CORS sem travar a porta no watch mode
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  await app.listen(3000, '0.0.0.0');
}
bootstrap();