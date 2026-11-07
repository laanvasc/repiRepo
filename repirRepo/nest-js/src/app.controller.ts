import { Controller, Get, Param, Post, Body } from '@nestjs/common';
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

  // Corrigido para remover o 'usuarios/' duplicado, ficando apenas ':id/atividades-frequentes'
  @Get(':id/atividades-frequentes')
  async getAtividadesFrequentesUsuario(@Param('id') id: string) {
    return this.appService.getAtividadesFrequentesUsuario(Number(id));
  }

  // Rota para verificar e atualizar a ofensiva do usuário
  @Get(':id/ofensiva') 
  async atualizarOfensiva(@Param('id') id: string) {
    return this.appService.atualizarOfensiva(Number(id));
  }

  @Get(':id/conquistas')
  async getConquistasUsuario(@Param('id') id: string) {
    return this.appService.getConquistasUsuario(Number(id));
  }

  @Post('login')
  async login(@Body() body: { email: string; senha?: string }) {
    return this.appService.validarLogin(body.email, body.senha);
  }

  // Rota mensal corrigida para chamar diretamente o AppService
  @Get(':id/mensal')
  async getDadosMensais(@Param('id') id: string) {
    return this.appService.getDadosMensais(Number(id));
  }

  @Post()
async criarUsuario(@Body() body: { nome: string; email: string; senha?: string }) {
  return this.appService.criarUsuario(body.nome, body.email, body.senha);
}

}