import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida as credenciais do usuário para login.
   * Procura o usuário pelo e-mail e verifica a senha (passwordHash).
   */
  async validarLogin(email: string, senha?: string) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { email },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado com este e-mail.');
    }

    // Se houver validação de senha cadastrada no banco
    if (usuario.passwordHash && senha && usuario.passwordHash !== senha) {
      throw new UnauthorizedException('Senha incorreta.');
    }

    return {
      mensagem: 'Login realizado com sucesso!',
      usuario: {
        id: Number(usuario.id),
        nome: usuario.nome,
        email: usuario.email,
        xp: usuario.xp,
        ofensivaAtual: usuario.ofensivaAtual,
        recordeMaximo: usuario.recordeMaximo,
        avatarUrl: usuario.avatarUrl,
      },
    };
  }

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
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: BigInt(id) },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    // Busca apenas as conquistas vinculadas ao usuário logado
    const usuarioConquistas = await this.prisma.usuario_conquistas.findMany({
      where: { id_usuario: BigInt(id) },
      include: {
        conquista: true, // Traz os detalhes da conquista associada
      },
    });

    // Mapeia para retornar um formato limpo diretamente com os dados da conquista e o progresso
    return usuarioConquistas.map((uc) => ({
      ...uc.conquista,
      progresso_atual: uc.progresso_atual,
      data_desbloqueio: uc.data_desbloqueio,
      id_conquista: Number(uc.conquista.id_conquista), // Converte BigInt para Number se necessário no front
    }));
  }

  async getUsuarioXp(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: BigInt(id) },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    const xpTotal = Number(usuario.xp ?? 0);
    const nivel = Math.floor(xpTotal / 1000) ?? 1;

    return {
      xp: xpTotal,
      nivel: nivel,
    };
  }

  async getUsuarios() {
    return this.prisma.usuario.findMany();
  }

  async atualizarOfensiva(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: BigInt(id) },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    const dataUltima = usuario.dataUltimaAtividade ? new Date(usuario.dataUltimaAtividade) : null;
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let novaOfensiva = usuario.ofensivaAtual ?? 0;
    let atualizou = false;

    if (!dataUltima) {
      novaOfensiva = 1;
      atualizou = true;
    } else {
      const ultimaAtividadeDia = new Date(dataUltima);
      ultimaAtividadeDia.setHours(0, 0, 0, 0);

      const diffTime = hoje.getTime() - ultimaAtividadeDia.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

      if (diffDays === 0) {
        // Mantém a ofensiva
      } else if (diffDays === 1) {
        novaOfensiva += 1;
        atualizou = true;
      } else if (diffDays > 1) {
        novaOfensiva = 1;
        atualizou = true;
      }
    }

    let novoRecorde = usuario.recordeMaximo ?? 0;
    if (novaOfensiva > novoRecorde) {
      novoRecorde = novaOfensiva;
    }

    if (atualizou || novaOfensiva !== usuario.ofensivaAtual || novoRecorde !== usuario.recordeMaximo) {
      const usuarioAtualizado = await this.prisma.usuario.update({
        where: { id: BigInt(id) },
        data: {
          ofensivaAtual: novaOfensiva,
          recordeMaximo: novoRecorde,
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

  // ==========================================
  // NOVOS MÉTODOS PARA O MENSAL CARD & OFENSIVA
  // ==========================================
async getDadosMensais(usuarioId: number) {
    const atividades = await this.prisma.usuario_atividades.findMany({
      where: { id_usuario: BigInt(usuarioId) },
    }).catch(() => []); 

    const diasConcluidos = [...new Set(atividades.map((a: any) => {
      return a.data_realizacao ? new Date(a.data_realizacao).getDate() : null;
    }).filter(Boolean))];

    const totalAtividades = atividades.length;
    const ofensivaAtual = await this.calcularOfensivaAtual(usuarioId);

    return {
      ofensivaAtual,
      totalAtividades,
      diasConcluidos,
    };
  }

  async calcularOfensivaAtual(usuarioId: number): Promise<number> {
    const atividades = await this.prisma.usuario_atividades.findMany({
      where: { id_usuario: BigInt(usuarioId) },
      orderBy: { data_realizacao: 'desc' },
    }).catch(() => []);

    if (!atividades || atividades.length === 0) return 0;

    // Usamos um type guard (t is number) para o TypeScript saber que o array final é apenas de números
    const diasUnicos = ([...new Set(atividades.map((a: any) => {
      if (!a.data_realizacao) return null;
      const d = new Date(a.data_realizacao);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }).filter((t): t is number => t !== null))] as number[]).sort((a, b) => b - a);

    if (diasUnicos.length === 0) return 0;

    let ofensiva = 0;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);

    let dataEsperada = hoje.getTime();

    if (diasUnicos[0] !== hoje.getTime() && diasUnicos[0] !== ontem.getTime()) {
      return 0;
    }

    if (diasUnicos[0] === ontem.getTime()) {
      dataEsperada = ontem.getTime();
    }

    for (const timestampDia of diasUnicos) {
      if (timestampDia === dataEsperada) {
        ofensiva++;
        const anterior = new Date(dataEsperada);
        anterior.setDate(anterior.getDate() - 1);
        dataEsperada = anterior.getTime();
      } else if (timestampDia < dataEsperada) {
        break;
      }
    }

    return ofensiva;
  }
}