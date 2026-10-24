import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsuarioNome(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: BigInt(id) },
    });
    return usuario ? usuario.nome : null;
  }

  async getUsuarioDataCreation(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: BigInt(id) },
    });
    return usuario ? usuario.created_at : null;
  }

  async getConquistasUsuario(id: number) {
    // Exemplo buscando do banco com Prisma (ajuste se sua relação for diferente)
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: BigInt(id) },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    // Retorna a lista de conquistas do usuário (ou todas as conquistas cadastradas por enquanto)
    return this.prisma.conquistas.findMany();
  }

  async getUsuarioXp(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: BigInt(id) },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    const xpTotal = Number(usuario.xp ?? 0);
    const nivel = Math.floor(xpTotal / 1000) ?? 1; // O nível aumenta a cada 1000xp 

    return {
      xp: xpTotal,
      nivel: nivel,
    };
  }

  async getUsuarios() {
    return this.prisma.usuario.findMany();
  }

  /**
   * Atualiza a ofensiva atual e o recorde do usuário com base na data da última atividade.
   * Regras:
   * - Se a última atividade foi hoje: mantém a ofensiva.
   * - Se foi ontem: incrementa +1 na ofensiva.
   * - Se passou mais de 1 dia sem atividade: reseta/reinicia a ofensiva para 1.
   */
  async atualizarOfensiva(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: BigInt(id) },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    const dataUltima = usuario.dataUltimaAtividade ? new Date(usuario.dataUltimaAtividade) : null;
    
    // Normaliza as datas para UTC/meia-noite para comparar apenas os dias (ignorando horas)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let novaOfensiva = usuario.ofensivaAtual ?? 0;
    let atualizou = false;

    if (!dataUltima) {
      // Se nunca teve atividade registrada, inicia com 1
      novaOfensiva = 1;
      atualizou = true;
    } else {
      const ultimaAtividadeDia = new Date(dataUltima);
      ultimaAtividadeDia.setHours(0, 0, 0, 0);

      // Diferença em dias
      const diffTime = hoje.getTime() - ultimaAtividadeDia.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

      if (diffDays === 0) {
        // Já realizou atividade hoje. Mantém a ofensiva atual.
      } else if (diffDays === 1) {
        // Realizou atividade ontem. Incrementa a sequência!
        novaOfensiva += 1;
        atualizou = true;
      } else if (diffDays > 1) {
        // Passou mais de um dia sem atividade. Reseta a ofensiva para 1.
        novaOfensiva = 1;
        atualizou = true;
      }
    }

    // Calcula se bateu o recorde máximo
    let novoRecorde = usuario.recordeMaximo ?? 0;
    if (novaOfensiva > novoRecorde) {
      novoRecorde = novaOfensiva;
    }

    // Se houver alteração, atualiza no banco de dados via Prisma
    if (atualizou || novaOfensiva !== usuario.ofensivaAtual || novoRecorde !== usuario.recordeMaximo) {
      const usuarioAtualizado = await this.prisma.usuario.update({
        where: { id: BigInt(id) },
        data: {
          ofensivaAtual: novaOfensiva,
          recordeMaximo: novoRecorde,
          // Caso queira atualizar a data da última atividade para hoje junto com a verificação:
          // dataUltimaAtividade: new Date(), 
        },
      });

      return {
        mensagem: 'Ofensiva verificada e atualizada com sucesso.',
        ofensivaAtual: usuarioAtualizado.ofensivaAtual,
        recordeMaximo: usuarioAtualizado.recordeMaximo,
      };
    }

    return {
      mensagem: 'Ofensiva já está atualizada para hoje.',
      ofensivaAtual: usuario.ofensivaAtual,
      recordeMaximo: usuario.recordeMaximo,
    };
  }
}