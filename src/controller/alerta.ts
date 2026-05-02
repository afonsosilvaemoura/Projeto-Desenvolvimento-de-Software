import { Request, Response } from 'express';
import { getDb } from '../database/db';
import { registarAuditoria } from '../services/auditoria';
import { EstadoAlerta, PerfilUtilizador } from '../models/entities';
import { v4 as uuidv4 } from 'uuid';

// Transições válidas no ciclo de vida do alerta
const TRANSICOES_VALIDAS: Record<EstadoAlerta, EstadoAlerta[]> = {
  [EstadoAlerta.NOVO]: [EstadoAlerta.VISTO],
  [EstadoAlerta.VISTO]: [EstadoAlerta.EM_SEGUIMENTO, EstadoAlerta.FECHADO],
  [EstadoAlerta.EM_SEGUIMENTO]: [EstadoAlerta.FECHADO],
  [EstadoAlerta.FECHADO]: [],
};

export class AlertaController {
  // GET /alertas  (médico vê os seus, admin vê todos)
  listar(req: Request, res: Response): void {
    const db = getDb();
    const user = req.utilizador!;
    const { estado, prioridade, utente_id } = req.query;

    let query = `
      SELECT a.*, u.nome AS utente_nome, m.nome AS medico_nome
      FROM alertas a
      JOIN utilizadores u ON u.id = a.utente_id
      JOIN utilizadores m ON m.id = a.medico_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (user.perfil === PerfilUtilizador.MEDICO) {
      query += ' AND a.medico_id = ?'; params.push(user.id);
    }
    if (user.perfil === PerfilUtilizador.UTENTE) {
      query += ' AND a.utente_id = ?'; params.push(user.id);
    }
    if (estado) { query += ' AND a.estado = ?'; params.push(estado); }
    if (prioridade) { query += ' AND a.prioridade = ?'; params.push(prioridade); }
    if (utente_id) { query += ' AND a.utente_id = ?'; params.push(utente_id); }

    query += ' ORDER BY a.criado_em DESC';

    const alertas = db.prepare(query).all(...params);
    registarAuditoria(user.id, 'LISTAR_ALERTAS', 'alertas');
    res.json(alertas);
  }

  // GET /alertas/:id
  obter(req: Request, res: Response): void {
    const db = getDb();
    const alerta = db.prepare(`
      SELECT a.*, u.nome AS utente_nome, m.nome AS medico_nome
      FROM alertas a
      JOIN utilizadores u ON u.id = a.utente_id
      JOIN utilizadores m ON m.id = a.medico_id
      WHERE a.id = ?
    `).get(req.params.id) as any;

    if (!alerta) { res.status(404).json({ erro: 'Alerta não encontrado.' }); return; }

    // Marcar automaticamente como VISTO ao abrir (se NOVO)
    if (alerta.estado === EstadoAlerta.NOVO) {
      const now = new Date().toISOString();
      db.prepare(`UPDATE alertas SET estado='VISTO', atualizado_em=? WHERE id=?`).run(now, alerta.id);
      db.prepare(`INSERT INTO alertas_acoes (id,alerta_id,utilizador_id,estado_novo,nota,data) VALUES (?,?,?,?,?,?)`)
        .run(uuidv4(), alerta.id, req.utilizador!.id, EstadoAlerta.VISTO, 'Alerta aberto automaticamente.', now);
      alerta.estado = EstadoAlerta.VISTO;
    }

    const acoes = db.prepare(`
      SELECT aa.*, u.nome AS utilizador_nome
      FROM alertas_acoes aa JOIN utilizadores u ON u.id = aa.utilizador_id
      WHERE aa.alerta_id = ? ORDER BY aa.data DESC
    `).all(req.params.id);

    registarAuditoria(req.utilizador!.id, 'VER_ALERTA', 'alertas', req.params.id as string);
    res.json({ ...alerta, acoes });
  }

  // PATCH /alertas/:id/estado
  atualizarEstado(req: Request, res: Response): void {
    const { estado_novo, nota } = req.body;
    if (!estado_novo || !nota) {
      res.status(400).json({ erro: 'Estado novo e nota são obrigatórios.' });
      return;
    }
    if (!Object.values(EstadoAlerta).includes(estado_novo)) {
      res.status(400).json({ erro: 'Estado inválido.' });
      return;
    }

    const db = getDb();
    const alerta = db.prepare('SELECT * FROM alertas WHERE id=?').get(req.params.id) as any;
    if (!alerta) { res.status(404).json({ erro: 'Alerta não encontrado.' }); return; }

    const transicoes = TRANSICOES_VALIDAS[alerta.estado as EstadoAlerta];
    if (!transicoes.includes(estado_novo as EstadoAlerta)) {
      res.status(400).json({
        erro: `Transição inválida: ${alerta.estado} → ${estado_novo}. Transições permitidas: ${transicoes.join(', ') || 'nenhuma'}.`
      });
      return;
    }

    const now = new Date().toISOString();
    db.prepare(`UPDATE alertas SET estado=?, atualizado_em=? WHERE id=?`).run(estado_novo, now, alerta.id);
    db.prepare(`INSERT INTO alertas_acoes (id,alerta_id,utilizador_id,estado_novo,nota,data) VALUES (?,?,?,?,?,?)`)
      .run(uuidv4(), alerta.id, req.utilizador!.id, estado_novo, nota, now);

    registarAuditoria(req.utilizador!.id, 'ATUALIZAR_ESTADO_ALERTA', 'alertas', alerta.id, { estado_novo, nota });
    res.json({ mensagem: `Alerta atualizado para ${estado_novo}.` });
  }

  // GET /alertas/limiares
  obterLimiares(_req: Request, res: Response): void {
    const db = getDb();
    const limiar = db.prepare('SELECT * FROM limiares_alerta LIMIT 1').get();
    res.json(limiar);
  }

  // PUT /alertas/limiares  (Admin only)
  atualizarLimiares(req: Request, res: Response): void {
    const { score_minimo, deterioracao_pontos } = req.body;
    if (score_minimo === undefined || deterioracao_pontos === undefined) {
      res.status(400).json({ erro: 'score_minimo e deterioracao_pontos são obrigatórios.' });
      return;
    }
    if (score_minimo < 0 || score_minimo > 40 || deterioracao_pontos < 1) {
      res.status(400).json({ erro: 'Valores inválidos para os limiares.' });
      return;
    }

    const db = getDb();
    db.prepare(`UPDATE limiares_alerta SET score_minimo=?, deterioracao_pontos=?, atualizado_em=?`)
      .run(score_minimo, deterioracao_pontos, new Date().toISOString());

    registarAuditoria(req.utilizador!.id, 'ATUALIZAR_LIMIARES', 'limiares_alerta', null, { score_minimo, deterioracao_pontos });
    res.json({ mensagem: 'Limiares atualizados com sucesso.', score_minimo, deterioracao_pontos });
  }
}
