import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsuarioXP(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: BigInt(id) },
    });

    if (!usuario) {
      throw new Error(`Usuário com ID não encontrado.`);
    }

    const xpTotal = usuario.xp ?? 0;
    const nivel = Math.floor(xpTotal / 1000) ?? 1; // o nivel do usuario aumenta cada 1000xp 

    return {
      xp: xpTotal,
      nivel: nivel
    };

  }

  async getUsuarios() {
    // Consulta todos os registos da tabela "usuario"
    return this.prisma.usuario.findMany();
  }
}