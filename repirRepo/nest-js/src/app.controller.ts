import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller('usuarios')
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

  @Get(':id/xp')
  async getUsuarioXp(@Param('id') id: string) {
    return this.appService.getUsuarioXp(Number(id));
  }

  @Get(':id/destaques-semanais')
  async getDestaquesSemanais(@Param('id') id: string) {
    return this.appService.getDestaquesSemanais(Number(id));
  }

  @Get(':id/proxima-atividade')
  async getProximaAtividade(@Param('id') id: string) {
    return this.appService.getProximaAtividade(Number(id));
  }

  @Get('catalogo-atividades')
  async getAtividadesCatalogo() {
    return this.appService.getAtividadesCatalogo();
  }

  @Get(':id/notificacoes')
  async getNotificacoesUsuario(@Param('id') id: string) {
    return this.appService.getNotificacoesUsuario(Number(id));
  }

  @Post(':id/registrar-atividade')
  async registrarRealizacaoAtividade(
    @Param('id') id: string,
    @Body() body: {
      id_atividade: number;
      duracao_minutos: number;
      intensidade: string;
      observacao?: string;
      xp_ganho?: number;
    },
  ) {
    return this.appService.registrarRealizacaoAtividade(Number(id), body);
  }

  @Get(':id/metas-progresso')
  async obterMetasProgresso(@Param('id') id: string) {
    return this.appService.calcularMetasProgresso(Number(id));
  }

  @Get(':id/atividades-frequentes')
  async getAtividadesFrequentesUsuario(@Param('id') id: string) {
    return this.appService.getAtividadesFrequentesUsuario(Number(id));
  }

  @Post(':id/atividades-frequentes')
  async criarAtividadeFrequente(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.appService.criarAtividadeFrequente(Number(id), body);
  }

  @Get(':id/progresso-semanal')
  async obterProgressoSemanal(@Param('id') id: string) {
    return this.appService.calcularProgressoSemanal(Number(id));
  }

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

  @Get(':id/mensal')
  async getDadosMensais(@Param('id') id: string) {
    return this.appService.getDadosMensais(Number(id));
  }

  @Post()
  async criarUsuario(@Body() body: { nome: string; email: string; senha?: string }) {
    return this.appService.criarUsuario(body.nome, body.email, body.senha);
  }

  @Get('atividades/:idAtividade/relacionadas')
  async getAtividadesRelacionadas(@Param('idAtividade') idAtividade: string) {
    return this.appService.getAtividadesRelacionadas(Number(idAtividade));
  }

  @Get('atividades/categoria/:categoria')
  async getAtividadesPorCategoria(@Param('categoria') categoria: string) {
    return this.appService.getAtividadesPorCategoria(Number(categoria));
  }
}