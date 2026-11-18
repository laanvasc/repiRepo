import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper privado para garantir que o ID é válido antes de converter para BigInt
   */
  private validarId(id: any): bigint {
    const num = Number(id);
    if (!id || isNaN(num) || num <= 0) {
      throw new BadRequestException(`ID de usuário inválido fornecido: ${id}`);
    }
    return BigInt(num);
  }

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

    // Busca apenas as conquistas vinculadas ao usuário logado
    const usuarioConquistas = await this.prisma.usuario_conquistas.findMany({
      where: { id_usuario: idBigInt },
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

 async getNotificacoesUsuario(id: number) {
    const idBigInt = this.validarId(id);
    const notificacoes: Array<{ id: string; titulo: string; tempo: string; lida: boolean }> = [];

    // 1. Verificar ofensiva atual (utilizando 'id' em vez de 'id_usuario')
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

    // 2. Buscar atividades realizadas hoje (utilizando 'atividades' no plural e 'id_historico')
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

    // Se a lista estiver vazia, retorna uma notificação de boas-vindas
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

    // 1. Buscar atividades frequentes do utilizador incluindo a relação 'atividade' (singular)
    const atividadesFrequentes = await this.prisma.atividade_frequente.findMany({
      where: { id_usuario: Number(idBigInt) },
      include: { atividade: true },
    });

    if (!atividadesFrequentes || atividadesFrequentes.length === 0) {
      return { status: 'vazio', mensagem: 'Nenhuma atividade frequente cadastrada' };
    }

    // 2. Descobrir o dia da semana atual (0 = Domingo, 1 = Segunda, etc.)
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // 0 a 6
    
    // Mapeamento seguro e tipado para evitar erros de indexação de string no TS
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

    // Filtrar apenas as atividades agendadas para hoje
    const agendadasHoje = atividadesFrequentes.filter(verificarDiaHoje);

    if (agendadasHoje.length === 0) {
      return { status: 'sem_atividades_hoje', mensagem: 'Nenhuma atividade para hoje' };
    }

    // 3. Buscar atividades já realizadas hoje pelo utilizador (desde a meia-noite)
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

    // 4. Filtrar as que ainda falta fazer
    const pendentes = agendadasHoje.filter((item) => {
      const idAtividadeMestre = Number(item.id_atividade);
      return !idsRealizadasHoje.includes(idAtividadeMestre);
    });

    // Se todas foram concluídas!
    if (pendentes.length === 0) {
      return { status: 'todas_concluidas', nome: 'Todas as atividades concluídas!' };
    }

    // 5. Encontrar a próxima com base no horário
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

    // Ordenar pelas mais próximas
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

    // 1. Calcula o início da semana atual (Domingo à 00:00:00)
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    inicioSemana.setHours(0, 0, 0, 0);

    // 2. Busca as atividades realizadas pelo utilizador apenas nesta semana
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

    // 3. Conta o total de treinos e soma o XP ganho apenas nesta semana
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

// Adiciona este método para listar as atividades do catálogo/mestre
  async getAtividadesCatalogo() {
    return this.prisma.atividades.findMany({
      orderBy: { nome_atividade: 'asc' },
    });
  }


  
  // Ajusta o criar para receber o id_atividade diretamente
  async criarAtividadeFrequente(usuarioId: number, dto: {
    id_atividade: number;
    repete_seg: boolean;
    repete_ter: boolean;
    repete_qua: boolean;
    repete_qui: boolean;
    repete_sex: boolean;
    repete_sab: boolean;
    repete_dom: boolean;
    horario?: string;
  }) {
    const idBigInt = this.validarId(usuarioId);

    // Converte a string de horário ("HH:mm") para o formato de Data do Prisma (@db.Time)
    let horarioDate = null;
    if (dto.horario) {
      horarioDate = new Date(`1970-01-01T${dto.horario}:00Z`);
    }

    // Cria diretamente a relação na tabela 'atividade_frequente' usando o id_atividade escolhido
    const novaFrequencia = await this.prisma.atividade_frequente.create({
      data: {
        id_usuario: Number(idBigInt),
        id_atividade: Number(dto.id_atividade),
        repete_seg: dto.repete_seg,
        repete_ter: dto.repete_ter,
        repete_qua: dto.repete_qua,
        repete_qui: dto.repete_qui,
        repete_sex: dto.repete_sex,
        repete_sab: dto.repete_sab,
        repete_dom: dto.repete_dom,
        horario: horarioDate,
      },
    });

    return {
      mensagem: 'Atividade frequente associada com sucesso!',
      atividade: novaFrequencia,
    };
  }
  // ==========================================
  // NOVOS MÉTODOS PARA O MENSAL CARD & OFENSIVA
  // ==========================================
  async getDadosMensais(usuarioId: number) {
    const idBigInt = this.validarId(usuarioId);
    const atividades = await this.prisma.usuario_atividades.findMany({
      where: { id_usuario: idBigInt },
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

async registrarRealizacaoAtividade(usuarioId: number, dto: {
    id_atividade: number;
    duracao_minutos: number;
    intensidade: string;
    observacao?: string;
    xp_ganho?: number;
  }) {
    const idBigInt = this.validarId(usuarioId);

    // Cálculo dinâmico do XP com base na intensidade e duração do treino (se o dto.xp_ganho não for explicitamente enviado)
    let xpGanho = dto.xp_ganho;
    if (!xpGanho) {
      let multiplicadorIntensidade = 10; // Base por minuto para intensidade moderada
      
      const intensidadeLower = (dto.intensidade || 'moderada').toLowerCase();
      if (intensidadeLower.includes('leve') || intensidadeLower.includes('baixa')) {
        multiplicadorIntensidade = 7;
      } else if (intensidadeLower.includes('intenso') || intensidadeLower.includes('alta') || intensidadeLower.includes('pesado')) {
        multiplicadorIntensidade = 15;
      }

      // XP = Duração em minutos * multiplicador (com um mínimo garantido de 30 XP)
      const minutos = Number(dto.duracao_minutos) || 15;
      xpGanho = Math.max(30, minutos * multiplicadorIntensidade);
    }

    // 1. Criar o registo histórico na tabela 'usuario_atividades'
    const historico = await this.prisma.usuario_atividades.create({
      data: {
        id_usuario: Number(idBigInt),
        id_atividade: Number(dto.id_atividade),
        xp_ganho: xpGanho,
        duracao_minutos: dto.duracao_minutos,
        intensidade: dto.intensidade,
        observacao: dto.observacao || null,
      },
    });

    // 2. Buscar o XP atual do utilizador e somar o novo valor
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: idBigInt },
    });

    const novoXp = (usuario?.xp ?? 0) + xpGanho;

    // 3. Atualizar o XP total e a data da última atividade no perfil do utilizador
    await this.prisma.usuario.update({
      where: { id: idBigInt },
      data: {
        xp: novoXp,
        dataUltimaAtividade: new Date(),
      },
    });

    // 4. Atualizar automaticamente a ofensiva (streak)
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

    // 1. Define o intervalo exato do dia atual (00:00:00 até 23:59:59)
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    const fimDoDia = new Date();
    fimDoDia.setHours(23, 59, 59, 999);

    // 2. Busca as atividades frequentes configuradas pelo utilizador
    const frequencias = await this.prisma.atividade_frequente.findMany({
      where: { id_usuario: Number(idBigInt) },
      include: {
        atividade: true,
      },
    }).catch(() => []);

    // 3. Busca as atividades já realizadas HOJE na tabela de histórico
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

    // Cria um Set com os IDs das atividades concluídas hoje para consulta rápida
    const idsRealizadosHoje = new Set(
      realizadasHoje.map((r: any) => Number(r.id_atividade))
    );

    // 4. Retorna os dados já com a flag 'realizada_hoje'
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

    // Datas de referência
    const agora = new Date();
    
    // Início e Fim do Dia Atual (00:00:00 até 23:59:59)
    const inicioDoDia = new Date(agora);
    inicioDoDia.setHours(0, 0, 0, 0);
    const fimDoDia = new Date(agora);
    fimDoDia.setHours(23, 59, 59, 999);

    // Início da Semana (Considerando segunda-feira como início)
    const diaSemana = agora.getDay(); // 0 = Domingo, 1 = Segunda, ...
    const diffParaSegunda = agora.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
    const inicioDaSemana = new Date(agora.setDate(diffParaSegunda));
    inicioDaSemana.setHours(0, 0, 0, 0);

    const fimDaSemana = new Date(inicioDaSemana);
    fimDaSemana.setDate(inicioDaSemana.getDate() + 6);
    fimDaSemana.setHours(23, 59, 59, 999);

    // 1. Contar atividades realizadas HOJE
    const totalHoje = await this.prisma.usuario_atividades.count({
      where: {
        id_usuario: idBigInt,
        data_realizacao: {
          gte: inicioDoDia,
          lte: fimDoDia,
        },
      },
    });

    // 2. Contar atividades realizadas NESTA SEMANA
    const totalSemana = await this.prisma.usuario_atividades.count({
      where: {
        id_usuario: idBigInt,
        data_realizacao: {
          gte: inicioDaSemana,
          lte: fimDaSemana,
        },
      },
    });

    // Podes definir metas padrão ou buscar de uma tabela de metas do utilizador
    const metaDiaria = 3;   // Exemplo: meta de 3 atividades por dia
    const metaSemanal = 15; // Exemplo: meta de 15 atividades por semana

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

async calcularProgressoSemanal(usuarioId: number) {
  const idBigInt = this.validarId(usuarioId);

  // Apenas validamos se o utilizador existe na base de dados
  const usuario = await this.prisma.usuario.findUnique({
    where: { id: idBigInt },
  });

  if (!usuario) {
    throw new Error('Utilizador não encontrado');
  }

  const metaDiariaPadrao = 3; // Regra padrão da aplicação para a meta diária

  const agora = new Date();
  const diaSemana = agora.getDay(); // 0 = Domingo, 1 = Segunda...
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

    // Verifica se já existe um utilizador com este e-mail
    const usuarioExistente = await this.prisma.usuario.findFirst({
      where: { email: emailNormalizado },
    });

    if (usuarioExistente) {
      throw new BadRequestException('Este e-mail já está registado.');
    }

    // Cria o novo utilizador no Supabase via Prisma
    const novoUsuario = await this.prisma.usuario.create({
      data: {
        nome: nome.trim(),
        email: emailNormalizado,
        passwordHash: senha || '', // Guarda a senha (ou hash dependendo da tua lógica)
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