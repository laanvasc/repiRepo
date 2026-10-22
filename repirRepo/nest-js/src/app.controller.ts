import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('usuarios')
  getUsuarios() {
    return this.appService.getUsuarios();
  }

  @Get(':id/xp')
  getUsuarioXP(@Param('id') id: string) {
    return this.appService.getUsuarioXP(Number(id));
  }

}