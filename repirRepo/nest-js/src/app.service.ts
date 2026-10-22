import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsuarios() {
    // Consulta todos os registos da tabela "usuario"
    return this.prisma.usuario.findMany();
  }
}