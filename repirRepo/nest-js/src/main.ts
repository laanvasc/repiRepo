import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

// Permite que BigInt seja convertido para String ao serializar JSON nas rotas
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
