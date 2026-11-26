import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  private validarId(id: any): bigint {
    const num = Number(id);
    if (!id || isNaN(num) || num <= 0) {
      throw new BadRequestException(`ID de usuário inválido fornecido: ${id}`);
    }
    return BigInt(num);
  }

  async validarLogin(email: string, senha?: string) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { email },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado com este e-mail.');
    }

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
    const idBigInt = this.validarId(id);
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: idBigInt },
    });
    return usuario ? usuario.nome : null;
  }

  async getUsuarioDataCreation(id: number) {
    const idBigInt = this.validarId(id);
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: idBigInt },
    });
    return usuario ? usuario.created_at : null;
  }

  async getConquistasUsuario(id: number) {
    const idBigInt = this.validarId(id);
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: idBigInt },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    const usuarioConquistas = await this.prisma.usuario_conquistas.findMany({
      where: { id_usuario: idBigInt },
      include: {
        conquista: true,
      },
    });

    return usuarioConquistas.map((uc) => ({
      ...uc.conquista,
      progresso_atual: uc.progresso_atual,
      data_desbloqueio: uc.data_desbloqueio,
      id_conquista: Number(uc.conquista.id_conquista),
    }));
  }

  async getNotificacoesUsuario(id: number) {
    const idBigInt = this.validarId(id);
    const notificacoes: Array<{ id: string; titulo: string; tempo: string; lida: boolean }> = [];

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: idBigInt },
      select: { ofensivaAtual: true, nome: true },
    });

    if (usuario && (usuario.ofensivaAtual ?? 0) > 0) {
      notificacoes.push({
        id: 'ofensiva-1',
        titulo: `🔥 Ofensiva em alta: ${usuario.ofensivaAtual} dias seguidos!`,
        tempo: 'Hoje',
        lida: false,
      });
    }

    const inicioHoje = new Date();
    inicioHoje.setHours(0, 0, 0, 0);

    const realizacoesHoje = await this.prisma.usuario_atividades.findMany({
      where: {
        id_usuario: idBigInt,
        data_realizacao: { gte: inicioHoje },
      },
      include: { atividades: true },
      take: 3,
    });

    realizacoesHoje.forEach((r: any, index: number) => {
      const nomeAtividade = r.atividades?.nome_atividade || 'Atividade';
      notificacoes.push({
        id: `atividade-${r.id_historico || index}`,
        titulo: `🎉 Treino concluído: ${nomeAtividade}!`,
        tempo: 'Hoje',
        lida: false,
      });
    });

    if (notificacoes.length === 0) {
      notificacoes.push({
        id: 'welcome-1',
        titulo: 'Bem-vindo ao Repy! Regista o teu primeiro treino.',
        tempo: 'Agora',
        lida: false,
      });
    }

    return notificacoes;
  }

  async getProximaAtividade(id: number) {
    const idBigInt = this.validarId(id);

    const atividadesFrequentes = await this.prisma.atividade_frequente.findMany({
      where: { id_usuario: Number(idBigInt) },
      include: { atividade: true },
    });

    if (!atividadesFrequentes || atividadesFrequentes.length === 0) {
      return { status: 'vazio', mensagem: 'Nenhuma atividade frequente cadastrada' };
    }

    const hoje = new Date();
    const diaSemana = hoje.getDay();

    const verificarDiaHoje = (item: any): boolean => {
      switch (diaSemana) {
        case 0: return item.repete_dom === true;
        case 1: return item.repete_seg === true;
        case 2: return item.repete_ter === true;
        case 3: return item.repete_qua === true;
        case 4: return item.repete_qui === true;
        case 5: return item.repete_sex === true;
        case 6: return item.repete_sab === true;
        default: return false;
      }
    };

    const agendadasHoje = atividadesFrequentes.filter(verificarDiaHoje);

    if (agendadasHoje.length === 0) {
      return { status: 'sem_atividades_hoje', mensagem: 'Nenhuma atividade para hoje' };
    }

    const inicioHoje = new Date();
    inicioHoje.setHours(0, 0, 0, 0);

    const realizadasHoje = await this.prisma.usuario_atividades.findMany({
      where: {
        id_usuario: idBigInt,
        data_realizacao: { gte: inicioHoje },
      },
      select: { id_atividade: true },
    });

    const idsRealizadasHoje = realizadasHoje.map((r) => Number(r.id_atividade));

    const pendentes = agendadasHoje.filter((item) => {
      const idAtividadeMestre = Number(item.id_atividade);
      return !idsRealizadasHoje.includes(idAtividadeMestre);
    });

    if (pendentes.length === 0) {
      return { status: 'todas_concluidas', nome: 'Todas as atividades concluídas!' };
    }

    const minutosAtuais = hoje.getHours() * 60 + hoje.getMinutes();

    const comMinutos = pendentes.map((item) => {
      let horarioStr = String(item.horario || '00:00');
      if (horarioStr.includes('T')) {
        const partes = horarioStr.split('T')[1];
        horarioStr = partes ? partes.split('.')[0] : '00:00';
      }
      const [h, m] = horarioStr.split(':').map(Number);
      return {
        ...item,
        totalMinutos: (h || 0) * 60 + (m || 0),
        nome_atividade: item.atividade?.nome_atividade || 'Atividade',
      };
    });

    comMinutos.sort((a, b) => a.totalMinutos - b.totalMinutos);

    const proxima = comMinutos.find((i) => i.totalMinutos >= minutosAtuais) || comMinutos[0];

    return {
      status: 'pendente',
      nome: proxima.nome_atividade,
      horario: proxima.horario,
    };
  }

  async getDestaquesSemanais(id: number) {
    const idBigInt = this.validarId(id);

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: idBigInt },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    inicioSemana.setHours(0, 0, 0, 0);

    const atividadesSemana = await this.prisma.usuario_atividades.findMany({
      where: {
        id_usuario: idBigInt,
        data_realizacao: {
          gte: inicioSemana,
        },
      },
      select: {
        xp_ganho: true,
      },
    });

    const totalTreinosSemana = atividadesSemana.length;
    const totalXpSemana = atividadesSemana.reduce(
      (acumulador, item) => acumulador + Number(item.xp_ganho ?? 0),
      0
    );

    return {
      treinos: totalTreinosSemana,
      xp: totalXpSemana,
      diasOfensiva: Number(usuario.ofensivaAtual ?? 0),
    };
  }

  async getUsuarioXp(id: number) {
    const idBigInt = this.validarId(id);
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: idBigInt },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    const xpTotal = Number(usuario.xp ?? 0);
    const nivel = Math.floor(xpTotal / 1000) + 1;

    return {
      xp: xpTotal,
      nivel: nivel,
    };
  }

  async getUsuarios() {
    return this.prisma.usuario.findMany();
  }

  async atualizarOfensiva(id: number) {
    const idBigInt = this.validarId(id);
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: idBigInt },
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
        where: { id: idBigInt },
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

  async getAtividadesCatalogo() {
    return this.prisma.atividades.findMany({
      orderBy: { nome_atividade: 'asc' },
    });
  }

  // Aceita tanto o JSON consolidado { id_usuario, atividades_frequentes: [...] } quanto um item direto
  async criarAtividadeFrequente(
    usuarioId: number,
    dto:
      | {
          id_usuario?: number;
          atividades_frequentes: Array<{
            id_usuario?: number;
            id_atividade: number;
            repete_seg?: boolean;
            repete_ter?: boolean;
            repete_qua?: boolean;
            repete_qui?: boolean;
            repete_sex?: boolean;
            repete_sab?: boolean;
            repete_dom?: boolean;
            horario?: string | null;
          }>;
        }
      | {
          id_atividade: number;
          repete_seg?: boolean;
          repete_ter?: boolean;
          repete_qua?: boolean;
          repete_qui?: boolean;
          repete_sex?: boolean;
          repete_sab?: boolean;
          repete_dom?: boolean;
          horario?: string | null;
        }
  ) {
    const idBigInt = this.validarId(usuarioId);
    const idUsuarioNum = Number(idBigInt);

    const usuarioExiste = await this.prisma.usuario.findUnique({
      where: { id: idBigInt },
      select: { id: true },
    });

    if (!usuarioExiste) {
      throw new NotFoundException(`Usuário com ID ${usuarioId} não encontrado.`);
    }

    const listaItens = Array.isArray((dto as any)?.atividades_frequentes)
      ? (dto as any).atividades_frequentes
      : [dto];

    if (!listaItens.length) {
      throw new BadRequestException('Nenhuma atividade frequente enviada.');
    }

    const dadosParaInserir = listaItens.map((item: any) => {
      const idAtivNum = Number(item?.id_atividade);
      if (!item?.id_atividade || isNaN(idAtivNum) || idAtivNum <= 0) {
        throw new BadRequestException(`ID de atividade inválido: ${item?.id_atividade}`);
      }

      let horarioDate: Date | null = null;
      if (item.horario) {
        horarioDate = new Date(`1970-01-01T${item.horario}:00Z`);
      }

      return {
        id_usuario: idUsuarioNum,
        id_atividade: BigInt(idAtivNum),
        repete_seg: Boolean(item.repete_seg),
        repete_ter: Boolean(item.repete_ter),
        repete_qua: Boolean(item.repete_qua),
        repete_qui: Boolean(item.repete_qui),
        repete_sex: Boolean(item.repete_sex),
        repete_sab: Boolean(item.repete_sab),
        repete_dom: Boolean(item.repete_dom),
        horario: horarioDate,
      };
    });

    const resultado = await this.prisma.atividade_frequente.createMany({
      data: dadosParaInserir,
    });

    return {
      mensagem: 'Atividades frequentes associadas com sucesso!',
      quantidade: resultado.count,
    };
  }

  async getAtividadesPorCategoria(categoria: number) {
    const catNum = Number(categoria);
    if (!categoria || isNaN(catNum) || catNum <= 0) {
      throw new BadRequestException(`Categoria inválida: ${categoria}`);
    }

    const atividades = await this.prisma.atividades.findMany({
      where: { categoria_atividade: catNum },
      orderBy: { id_atividade: 'asc' },
    });

    return atividades.map((item) => ({
      ...item,
      id_atividade: Number(item.id_atividade),
    }));
  }

  async getAtividadesRelacionadas(idAtividade: number) {
    const numId = Number(idAtividade);
    if (!idAtividade || isNaN(numId) || numId <= 0) {
      throw new BadRequestException(`ID de atividade inválido: ${idAtividade}`);
    }

    const atividadeBase = await this.prisma.atividades.findUnique({
      where: { id_atividade: BigInt(numId) },
      select: {
        id_atividade: true,
        nome_atividade: true,
        categoria_atividade: true,
      },
    });

    if (!atividadeBase) {
      throw new NotFoundException(`Atividade com ID ${idAtividade} não encontrada.`);
    }

    const relacionadas = await this.prisma.atividades.findMany({
      where: {
        categoria_atividade: atividadeBase.categoria_atividade,
      },
      orderBy: {
        id_atividade: 'asc',
      },
    });

    return {
      categoria_atividade: atividadeBase.categoria_atividade,
      atividadeBase: {
        ...atividadeBase,
        id_atividade: Number(atividadeBase.id_atividade),
      },
      atividades: relacionadas.map((item) => ({
        ...item,
        id_atividade: Number(item.id_atividade),
      })),
    };
  }

  async getDadosMensais(usuarioId: number) {
    const idBigInt = this.validarId(usuarioId);
    const agora = new Date();
    const anoAtual = agora.getFullYear();
    const mesAtual = agora.getMonth();
    const diaHoje = agora.getDate();

    const inicioMes = new Date(anoAtual, mesAtual, 1, 0, 0, 0, 0);
    const fimMes = new Date(anoAtual, mesAtual + 1, 0, 23, 59, 59, 999);
    const totalDiasMes = fimMes.getDate();

    const atividadesMes = await this.prisma.usuario_atividades.findMany({
      where: {
        id_usuario: idBigInt,
        data_realizacao: {
          gte: inicioMes,
          lte: fimMes,
        },
      },
    }).catch(() => []);

    const diasConcluidos = [...new Set(
      atividadesMes
        .map((a: any) => (a.data_realizacao ? new Date(a.data_realizacao).getDate() : null))
        .filter((d): d is number => d !== null)
    )].sort((a, b) => a - b);

    const diasPassados: number[] = [];
    for (let dia = 1; dia < diaHoje; dia++) {
      if (!diasConcluidos.includes(dia)) {
        diasPassados.push(dia);
      }
    }

    const primeiroDiaSemana = inicioMes.getDay();
    const weeks: Array<Array<number | ''>> = [];
    let semanaAtual: Array<number | ''> = Array(primeiroDiaSemana).fill('');

    for (let dia = 1; dia <= totalDiasMes; dia++) {
      semanaAtual.push(dia);
      if (semanaAtual.length === 7) {
        weeks.push(semanaAtual);
        semanaAtual = [];
      }
    }

    if (semanaAtual.length > 0) {
      while (semanaAtual.length < 7) {
        semanaAtual.push('');
      }
      weeks.push(semanaAtual);
    }

    const ofensivaAtual = await this.calcularOfensivaAtual(usuarioId);
    const concluiuHoje = diasConcluidos.includes(diaHoje);

    return {
      ano: anoAtual,
      mes: mesAtual + 1,
      diaHoje,
      concluiuHoje,
      ofensivaAtual,
      totalAtividades: atividadesMes.length,
      diasConcluidos,
      diasPassados,
      weeks,
    };
  }

  async registrarRealizacaoAtividade(usuarioId: number, dto: {
    id_atividade: number;
    duracao_minutos: number;
    intensidade: string;
    observacao?: string;
    xp_ganho?: number;
  }) {
    const idBigInt = this.validarId(usuarioId);

    let xpGanho = dto.xp_ganho;
    if (!xpGanho) {
      let multiplicadorIntensidade = 10;

      const intensidadeLower = (dto.intensidade || 'moderada').toLowerCase();
      if (intensidadeLower.includes('leve') || intensidadeLower.includes('baixa')) {
        multiplicadorIntensidade = 7;
      } else if (intensidadeLower.includes('intenso') || intensidadeLower.includes('alta') || intensidadeLower.includes('pesado')) {
        multiplicadorIntensidade = 15;
      }

      const minutos = Number(dto.duracao_minutos) || 15;
      xpGanho = Math.max(30, minutos * multiplicadorIntensidade);
    }

    const historico = await this.prisma.usuario_atividades.create({
      data: {
        id_usuario: idBigInt,
        id_atividade: BigInt(dto.id_atividade),
        xp_ganho: xpGanho,
        duracao_minutos: dto.duracao_minutos,
        intensidade: dto.intensidade,
        observacao: dto.observacao || null,
      },
    });

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: idBigInt },
    });

    const novoXp = (usuario?.xp ?? 0) + xpGanho;

    await this.prisma.usuario.update({
      where: { id: idBigInt },
      data: {
        xp: novoXp,
        dataUltimaAtividade: new Date(),
      },
    });

    await this.atualizarOfensiva(Number(idBigInt));

    return {
      mensagem: 'Atividade concluída com sucesso! XP adicionado.',
      xpAdicionado: xpGanho,
      novoXpTotal: novoXp,
      historico,
    };
  }

  async getAtividadesFrequentesUsuario(id: number) {
    const idBigInt = this.validarId(id);

    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    const fimDoDia = new Date();
    fimDoDia.setHours(23, 59, 59, 999);

    const frequencias = await this.prisma.atividade_frequente.findMany({
      where: { id_usuario: Number(idBigInt) },
      include: {
        atividade: true,
      },
    }).catch(() => []);

    const realizadasHoje = await this.prisma.usuario_atividades.findMany({
      where: {
        id_usuario: idBigInt,
        data_realizacao: {
          gte: inicioDoDia,
          lte: fimDoDia,
        },
      },
      select: {
        id_atividade: true,
      },
    }).catch(() => []);

    const idsRealizadosHoje = new Set(
      realizadasHoje.map((r: any) => Number(r.id_atividade))
    );

    return frequencias.map((f: any) => {
      const idAtividadeNum = f.id_atividade ? Number(f.id_atividade) : null;

      return {
        id_atividade_frequente: f.id_atividade_frequente,
        id_atividade: idAtividadeNum,
        nome_atividade: f.atividade?.nome_atividade || 'Atividade',
        categoria_atividade: f.atividade?.categoria_atividade || null,
        repete_seg: f.repete_seg ?? false,
        repete_ter: f.repete_ter ?? false,
        repete_qua: f.repete_qua ?? false,
        repete_qui: f.repete_qui ?? false,
        repete_sex: f.repete_sex ?? false,
        repete_sab: f.repete_sab ?? false,
        repete_dom: f.repete_dom ?? false,
        horario: f.horario,
        realizada_hoje: idAtividadeNum ? idsRealizadosHoje.has(idAtividadeNum) : false,
      };
    });
  }

async calcularMetasProgresso(usuarioId: number) {
    const idBigInt = this.validarId(usuarioId);

    const agora = new Date();

    const inicioDoDia = new Date(agora);
    inicioDoDia.setHours(0, 0, 0, 0);
    const fimDoDia = new Date(agora);
    fimDoDia.setHours(23, 59, 59, 999);

    const diaSemana = agora.getDay();
    const diffParaSegunda = agora.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
    const inicioDaSemana = new Date(agora);
    inicioDaSemana.setDate(diffParaSegunda);
    inicioDaSemana.setHours(0, 0, 0, 0);

    const fimDaSemana = new Date(inicioDaSemana);
    fimDaSemana.setDate(inicioDaSemana.getDate() + 6);
    fimDaSemana.setHours(23, 59, 59, 999);

    const totalHoje = await this.prisma.usuario_atividades.count({
      where: {
        id_usuario: idBigInt,
        data_realizacao: {
          gte: inicioDoDia,
          lte: fimDoDia,
        },
      },
    });

    const totalSemana = await this.prisma.usuario_atividades.count({
      where: {
        id_usuario: idBigInt,
        data_realizacao: {
          gte: inicioDaSemana,
          lte: fimDaSemana,
        },
      },
    });

    const frequenciasUsuario = await this.prisma.atividade_frequente.findMany({
      where: { id_usuario: Number(idBigInt) },
    });

    const agendadasHoje = frequenciasUsuario.filter((item: any) => {
      switch (diaSemana) {
        case 0:
          return item.repete_dom === true;
        case 1:
          return item.repete_seg === true;
        case 2:
          return item.repete_ter === true;
        case 3:
          return item.repete_qua === true;
        case 4:
          return item.repete_qui === true;
        case 5:
          return item.repete_sex === true;
        case 6:
          return item.repete_sab === true;
        default:
          return false;
      }
    });

    const totalCatalogo =
      agendadasHoje.length > 0 ? agendadasHoje.length : await this.prisma.atividades.count();

    const metaDiaria = totalCatalogo;
    const metaSemanal = metaDiaria * 5;

    return {
      progresso_diario: {
        realizadas: totalHoje,
        meta: metaDiaria,
        concluido: totalHoje >= metaDiaria,
      },
      progresso_semanal: {
        realizadas: totalSemana,
        meta: metaSemanal,
        concluido: totalSemana >= metaSemanal,
      },
    };
  }

  async calcularOfensivaAtual(usuarioId: number): Promise<number> {
    const idBigInt = this.validarId(usuarioId);
    const atividades = await this.prisma.usuario_atividades.findMany({
      where: { id_usuario: idBigInt },
      orderBy: { data_realizacao: 'desc' },
    }).catch(() => []);

    if (!atividades || atividades.length === 0) return 0;

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

  async calcularProgressoSemanal(usuarioId: number) {
    const idBigInt = this.validarId(usuarioId);

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: idBigInt },
    });

    if (!usuario) {
      throw new Error('Utilizador não encontrado');
    }

    const metaDiariaPadrao = 3;

    const agora = new Date();
    const diaSemana = agora.getDay();
    const diffParaSegunda = agora.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);

    const inicioSemana = new Date(agora);
    inicioSemana.setDate(diffParaSegunda);
    inicioSemana.setHours(0, 0, 0, 0);

    const diasDaSemana = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
    const resultadoDias = [];

    for (let i = 0; i < 7; i++) {
      const diaAtual = new Date(inicioSemana);
      diaAtual.setDate(inicioSemana.getDate() + i);

      const proximoDia = new Date(diaAtual);
      proximoDia.setDate(diaAtual.getDate() + 1);

      const realizadas = await this.prisma.usuario_atividades.count({
        where: {
          id_usuario: idBigInt,
          data_realizacao: {
            gte: diaAtual,
            lt: proximoDia,
          },
        },
      });

      const hoje = new Date();
      const éHoje = diaAtual.toDateString() === hoje.toDateString();

      resultadoDias.push({
        dia: diasDaSemana[i],
        atividadesFeitas: realizadas,
        metaDiaria: metaDiariaPadrao,
        atual: éHoje,
      });
    }

    return resultadoDias;
  }

  async criarUsuario(nome: string, email: string, senha?: string) {
    const emailNormalizado = email.trim().toLowerCase();

    const usuarioExistente = await this.prisma.usuario.findFirst({
      where: { email: emailNormalizado },
    });

    if (usuarioExistente) {
      throw new BadRequestException('Este e-mail já está registado.');
    }

    const novoUsuario = await this.prisma.usuario.create({
      data: {
        nome: nome.trim(),
        email: emailNormalizado,
        passwordHash: senha || '',
        xp: 0,
        ofensivaAtual: 0,
        recordeMaximo: 0,
      },
    });

    return {
      mensagem: 'Usuário cadastrado com sucesso!',
      usuario: {
        id: Number(novoUsuario.id),
        nome: novoUsuario.nome,
        email: novoUsuario.email,
      },
    };
  }
}