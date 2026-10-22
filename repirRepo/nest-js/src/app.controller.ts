import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller('usuarios') // <-- Garanta que o prefixo é 'usuarios'
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(':id/xp') // <-- Rota completa: /usuarios/:id/xp
  async getUsuarioXp(@Param('id') id: string) {
    return this.appService.getUsuarioXp(Number(id));
  }
}