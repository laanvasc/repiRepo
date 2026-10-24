import { Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller('usuarios') // <-- Prefixo da rota
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return 'Retorno do endpoint /usuarios';
  }

  @Get(':id/nome') 
  async getUsuarioNome(@Param('id') id: string) {
    return this.appService.getUsuarioNome(Number(id));
  }

  @Get(':id/xp') // <-- Rota: /usuarios/:id/xp
  async getUsuarioXp(@Param('id') id: string) {
    return this.appService.getUsuarioXp(Number(id));
  }

  // Rota para verificar e atualizar a ofensiva do usuário
  // Pode ser GET ou POST (utilizei GET para facilitar testes no navegador/Postman)
  @Get(':id/ofensiva') 
  async atualizarOfensiva(@Param('id') id: string) {
    return this.appService.atualizarOfensiva(Number(id));
  }
}