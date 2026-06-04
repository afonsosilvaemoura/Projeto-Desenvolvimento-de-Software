import { Response } from 'express';
import { calcularCARAT, PERGUNTAS_CARAT, OPCOES_RESPOSTA } from '../services/carat.service';
import { db } from '../database/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { auditoriaService } from '../services/auditoria.service';

const ip = (req: any) =>
  (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || '?';

export async function criarAvaliacaoCarat(req: AuthRequest, res: Response) {
  try {
    const { perg1, perg2, perg3, perg4, perg5, perg6, perg7, perg8, perg9, perg10, utente_id } = req.body;

    const arrayRespostas = [
      Number(perg1), Number(perg2), Number(perg3), Number(perg4), Number(perg5),
      Number(perg6), Number(perg7), Number(perg8), Number(perg9), Number(perg10),
    ];

    const resultado = calcularCARAT(arrayRespostas);

    let targetUtenteId: number | null = null;
    let medicoNome: string | null = null;

    if (req.user?.role === 'medico') {
      const utenteIdNum = Number(utente_id ?? 0);
      if (!utenteIdNum) return res.status(400).json({ erro: 'ID do utente obrigatório para médicos.' });
      const utente = db.prepare('SELECT * FROM utente WHERE id = ?').get(utenteIdNum) as any;
      if (!utente) return res.status(404).json({ erro: 'Utente não encontrado.' });
      if (utente.medico_id !== req.user.id) return res.status(403).json({ erro: 'Utente não está atribuído a este médico.' });
      targetUtenteId = utente.id;
      medicoNome = req.user.username;
    } else if (req.user?.role === 'utente') {
      targetUtenteId = req.user.id;
    } else {
      return res.status(403).json({ erro: 'Sem autorização para criar avaliação CARAT.' });
    }

    const recomendacao = resultado.controloTotal === 'CONTROLADA'
      ? 'Controlado — próxima avaliação em 12 semanas.'
      : resultado.scoreTotal > 16 ? 'Vigiar — marque consulta em 4 semanas.' : 'Urgente — consulte o médico com brevidade.';
    const proximoPassoSemanas = resultado.controloTotal === 'CONTROLADA' ? 12 : resultado.scoreTotal > 16 ? 4 : 2;

    const result = db.prepare(
      `INSERT INTO avaliacao_carat
       (utente_id, medico_nome, respostas, scoreTotal, scoreRinite, scoreAsma, nivelControlo, recomendacao, proximoPassoSemanas, anonima, dataCriacao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`
    ).run(
      targetUtenteId, medicoNome, JSON.stringify(arrayRespostas),
      resultado.scoreTotal, resultado.scoreRinite, resultado.scoreAsma,
      resultado.controloTotal, recomendacao, proximoPassoSemanas,
      new Date().toISOString()
    );

    gerarAlertas(targetUtenteId, resultado.scoreTotal, Number(result.lastInsertRowid));

    auditoriaService.respostaCarat(
      req.user!.id, req.user!.nome, req.user!.role,
      resultado.scoreTotal, Number(result.lastInsertRowid), ip(req)
    );

    return res.status(201).json({
      mensagem: 'Questionário CARAT processado com sucesso!',
      avaliacao: {
        id: result.lastInsertRowid,
        nome: req.user?.username ?? 'Doente',
        scoreTotal: resultado.scoreTotal,
        scoreRinite: resultado.scoreRinite,
        scoreAsma: resultado.scoreAsma,
        controloTotal: resultado.controloTotal,
        dataCriacao: new Date().toISOString(),
      },
    });
  } catch (erro: any) {
    return res.status(400).json({ erro: erro.message || 'Erro ao processar o CARAT' });
  }
}

function gerarAlertas(utenteId: number | null, scoreTotal: number, avaliacaoId: number) {
  if (!utenteId) return;
  const limiar = db.prepare('SELECT * FROM limiar_alerta ORDER BY id LIMIT 1').get() as any;
  const scoreMinimo = limiar?.scoreMinimo ?? 24;
  const deterioracaoPontos = limiar?.deterioracaoPontos ?? 3;
  const now = new Date().toISOString();

  if (scoreTotal < scoreMinimo) {
    const prioridade = scoreTotal < 10 ? 'CRITICA' : scoreTotal < 16 ? 'ALTA' : 'MEDIA';
    db.prepare(
      `INSERT INTO alerta (utente_id, avaliacao_id, tipo, prioridade, motivo, estado, dataCriacao, dataAtualizacao)
       VALUES (?, ?, 'SCORE_BAIXO', ?, ?, 'NOVO', ?, ?)`
    ).run(utenteId, avaliacaoId, prioridade, `Score CARAT de ${scoreTotal} abaixo do limiar de ${scoreMinimo}`, now, now);
  }

  const anterior = db.prepare(
    'SELECT scoreTotal FROM avaliacao_carat WHERE utente_id = ? AND id != ? ORDER BY dataCriacao DESC LIMIT 1'
  ).get(utenteId, avaliacaoId) as any;

  if (anterior && (anterior.scoreTotal - scoreTotal) >= deterioracaoPontos) {
    db.prepare(
      `INSERT INTO alerta (utente_id, avaliacao_id, tipo, prioridade, motivo, estado, dataCriacao, dataAtualizacao)
       VALUES (?, ?, 'DETERIORACAO', 'ALTA', ?, 'NOVO', ?, ?)`
    ).run(utenteId, avaliacaoId, `Deterioração de ${anterior.scoreTotal - scoreTotal} pontos face à avaliação anterior`, now, now);
  }
}

export async function listarAvaliacoesCarat(req: AuthRequest, res: Response) {
  try {
    let lista: any[];

    if (req.user?.role === 'utente') {
      lista = db.prepare('SELECT * FROM avaliacao_carat WHERE utente_id = ? ORDER BY dataCriacao DESC').all(req.user.id);
    } else if (req.user?.role === 'medico') {
      const utentes = db.prepare('SELECT id FROM utente WHERE medico_id = ?').all(req.user.id) as any[];
      if (!utentes.length) return res.json([]);
      const utenteIdParam = req.query.utente_id ? Number(req.query.utente_id) : null;
      if (utenteIdParam) {
        if (!(utentes as any[]).some(u => u.id === utenteIdParam))
          return res.status(403).json({ erro: 'Utente não atribuído a este médico.' });
        lista = db.prepare('SELECT * FROM avaliacao_carat WHERE utente_id = ? ORDER BY dataCriacao DESC').all(utenteIdParam);
      } else {
        const placeholders = utentes.map(() => '?').join(',');
        lista = db.prepare(`SELECT * FROM avaliacao_carat WHERE utente_id IN (${placeholders}) ORDER BY dataCriacao DESC`).all(...utentes.map(u => u.id));
      }
    } else {
      lista = db.prepare('SELECT * FROM avaliacao_carat ORDER BY dataCriacao DESC').all();
    }

    return res.json(lista.map(c => ({
      id: c.id, utente_id: c.utente_id, scoreTotal: c.scoreTotal, scoreRinite: c.scoreRinite,
      scoreAsma: c.scoreAsma, nivelControlo: c.nivelControlo, controloTotal: c.nivelControlo,
      dataCriacao: c.dataCriacao,
    })));
  } catch (erro: any) {
    return res.status(500).json({ erro: erro.message });
  }
}
