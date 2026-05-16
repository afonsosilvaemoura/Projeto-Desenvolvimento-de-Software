import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/database';
import {
  calcularScore, interpretarScore, gerarRecomendacoes,
  calcularProximoPasso, gerarAlertasSeNecessario, PERGUNTAS_CARAT
} from '../services/carat';
import { registarAuditoria } from '../services/auditoria';
import { PerfilUtilizador } from '../models/todos.entity';
import { environment } from '../environment/environment';

type RequestWithUtilizador = Request & { utilizador?: { id: string; perfil: PerfilUtilizador } };

export class CaratController {
  // GET /carat/perguntas
  perguntas(_req: Request, res: Response): void {
    res.json({ perguntas: PERGUNTAS_CARAT });
  }

  // POST /carat/avaliacoes
  submeter(req: Request, res: Response): void {
    const { respostas, utente_id } = req.body;
    const user = (req as RequestWithUtilizador).utilizador; // pode ser undefined (anónimo) — definido na rota

    if (!respostas || !Array.isArray(respostas)) {
      res.status(400).json({ erro: 'O campo "respostas" é obrigatório e deve ser um array.' });
      return;
    }

    let score: number;
    try {
      score = calcularScore(respostas);
    } catch (e: any) {
      res.status(400).json({ erro: e.message });
      return;
    }

    const nivel = interpretarScore(score);
    const recomendacoes = gerarRecomendacoes(nivel);
    const proximoPasso = calcularProximoPasso(nivel);
    const db = getDb();

    // Determinar utente_id real
    let utenteIdFinal: string | null = null;
    let medicoIdFinal: string | null = null;
    const anonima = !user;

    if (!anonima && user) {
      if (user.perfil === PerfilUtilizador.UTENTE) {
        utenteIdFinal = user.id;
        // obter médico associado
        const ut = db.prepare('SELECT medico_id FROM utentes WHERE id=?').get(user.id) as any;
        medicoIdFinal = ut?.medico_id ?? null;
      } else if (user.perfil === PerfilUtilizador.MEDICO) {
        // médico faz avaliação em consulta — utente_id deve vir no body
        if (!utente_id) {
          res.status(400).json({ erro: 'O campo "utente_id" é obrigatório quando o médico submete a avaliação.' });
          return;
        }
        utenteIdFinal = utente_id;
        medicoIdFinal = user.id;
      }
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    // Só persistir se não for anónimo
    if (!anonima && utenteIdFinal) {
      // Score da avaliação anterior para detetar deterioração
      const anterior = db.prepare(
        'SELECT score FROM avaliacoes_carat WHERE utente_id=? ORDER BY data DESC LIMIT 1'
      ).get(utenteIdFinal) as any;

      db.prepare(`
        INSERT INTO avaliacoes_carat
          (id,utente_id,medico_id,data,respostas,score,nivel_controlo,recomendacoes,proximo_passo_semanas,anonima,criado_em)
        VALUES (?,?,?,?,?,?,?,?,?,0,?)
      `).run(id, utenteIdFinal, medicoIdFinal, now.split('T')[0],
             JSON.stringify(respostas), score, nivel, recomendacoes, proximoPasso, now);

      gerarAlertasSeNecessario(id, utenteIdFinal, medicoIdFinal!, score, anterior?.score ?? null);
      registarAuditoria(user!.id, 'SUBMETER_CARAT', 'avaliacoes_carat', id, { score, nivel });
    }

    res.status(anonima ? 200 : 201).json({
      id: anonima ? null : id,
      score,
      nivel_controlo: nivel,
      recomendacoes,
      proximo_passo_semanas: proximoPasso,
      anonima,
      persistida: !anonima,
    });
  }

  // GET /carat/avaliacoes/utente/:utenteId
  historico(req: Request, res: Response): void {
    const db = getDb();
    const utenteId = req.params.utenteId as string;
    const avaliacoes = db.prepare(`
      SELECT * FROM avaliacoes_carat WHERE utente_id=? ORDER BY data DESC
    `).all(utenteId).map((a: any) => ({
      ...a,
      respostas: JSON.parse(a.respostas),
    }));

    registarAuditoria((req as any).utilizador!.id, 'VER_HISTORICO_CARAT', 'avaliacoes_carat', utenteId);
    res.json(avaliacoes);
  }

  // GET /carat/avaliacoes/:id
  obter(req: Request, res: Response): void {
    const db = getDb();
    const avaliacaoId = req.params.id as string;
    const av = db.prepare('SELECT * FROM avaliacoes_carat WHERE id=?').get(avaliacaoId) as any;
    if (!av) { res.status(404).json({ erro: 'Avaliação não encontrada.' }); return; }

    registarAuditoria((req as any).utilizador!.id, 'VER_AVALIACAO_CARAT', 'avaliacoes_carat', avaliacaoId);
    res.json({ ...av, respostas: JSON.parse(av.respostas) });
  }
}
