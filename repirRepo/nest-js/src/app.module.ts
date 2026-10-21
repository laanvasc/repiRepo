import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Disponibiliza as variáveis do .env em toda a aplicação
    }),
  ],
})
export class AppModule {}