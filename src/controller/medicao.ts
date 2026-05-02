import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/db';
import { registarAuditoria } from '../services/auditoria';
import { EstadoMedicacao } from '../models/entities';

export class MedicacaoController {
  // GET /utentes/:utenteId/medicacao
  listar(req: Request, res: Response): void {
    const db = getDb();
    const meds = db.prepare(
      'SELECT * FROM medicacao WHERE utente_id=? ORDER BY data_inicio DESC'
    ).all(req.params.utenteId);
    registarAuditoria(req.utilizador!.id, 'LISTAR_MEDICACAO', 'medicacao', req.params.utenteId);
    res.json(meds.length ? meds : { mensagem: 'Utente sem medicação associada.', data: [] });
  }

  // POST /utentes/:utenteId/medicacao
  registar(req: Request, res: Response): void {
    const { farmaco, dosagem, posologia, data_inicio, data_fim } = req.body;
    if (!farmaco || !dosagem || !posologia || !data_inicio) {
      res.status(400).json({ erro: 'farmaco, dosagem, posologia e data_inicio são obrigatórios.' });
      return;
    }
    const id = uuidv4();
    const now = new Date().toISOString();
    const db = getDb();
    db.prepare(`
      INSERT INTO medicacao (id,utente_id,medico_id,farmaco,dosagem,posologia,data_inicio,data_fim,estado,criado_em,atualizado_em)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `).run(id, req.params.utenteId, req.utilizador!.id, farmaco, dosagem, posologia,
           data_inicio, data_fim ?? null, EstadoMedicacao.ATIVA, now, now);

    registarAuditoria(req.utilizador!.id, 'REGISTAR_MEDICACAO', 'medicacao', id, { farmaco, dosagem });
    res.status(201).json({ id, farmaco, dosagem, posologia, estado: EstadoMedicacao.ATIVA });
  }

  // PUT /utentes/:utenteId/medicacao/:id
  atualizar(req: Request, res: Response): void {
    const db = getDb();
    const med = db.prepare('SELECT * FROM medicacao WHERE id=? AND utente_id=?')
      .get(req.params.id, req.params.utenteId) as any;
    if (!med) { res.status(404).json({ erro: 'Medicação não encontrada.' }); return; }

    const { farmaco, dosagem, posologia, data_fim } = req.body;
    const now = new Date().toISOString();
    db.prepare(`UPDATE medicacao SET farmaco=COALESCE(?,farmaco), dosagem=COALESCE(?,dosagem),
      posologia=COALESCE(?,posologia), data_fim=COALESCE(?,data_fim), atualizado_em=? WHERE id=?`)
      .run(farmaco ?? null, dosagem ?? null, posologia ?? null, data_fim ?? null, now, req.params.id);

    registarAuditoria(req.utilizador!.id, 'ATUALIZAR_MEDICACAO', 'medicacao', req.params.id);
    res.json({ mensagem: 'Medicação atualizada.' });
  }

  // PATCH /utentes/:utenteId/medicacao/:id/suspender
  suspender(req: Request, res: Response): void {
    const { motivo } = req.body;
    if (!motivo) { res.status(400).json({ erro: 'O motivo de suspensão é obrigatório.' }); return; }

    const db = getDb();
    const now = new Date().toISOString();
    const result = db.prepare(`
      UPDATE medicacao SET estado='INATIVA', motivo_suspensao=?, atualizado_em=?
      WHERE id=? AND utente_id=?
    `).run(motivo, now, req.params.id, req.params.utenteId);

    if (result.changes === 0) { res.status(404).json({ erro: 'Medicação não encontrada.' }); return; }

    registarAuditoria(req.utilizador!.id, 'SUSPENDER_MEDICACAO', 'medicacao', req.params.id, { motivo });
    res.json({ mensagem: 'Medicação suspensa. Registo mantido por motivos de auditoria clínica.' });
  }
}

export class ExameController {
  // GET /utentes/:utenteId/exames
  listar(req: Request, res: Response): void {
    const db = getDb();
    const exames = db.prepare('SELECT * FROM exames WHERE utente_id=? ORDER BY data DESC').all(req.params.utenteId);
    registarAuditoria(req.utilizador!.id, 'LISTAR_EXAMES', 'exames', req.params.utenteId);
    res.json(exames);
  }

  // POST /utentes/:utenteId/exames
  registar(req: Request, res: Response): void {
    const { tipo, justificacao, data } = req.body;
    if (!tipo || !justificacao || !data) {
      res.status(400).json({ erro: 'tipo, justificacao e data são obrigatórios.' });
      return;
    }
    const id = uuidv4();
    const now = new Date().toISOString();
    const db = getDb();
    db.prepare(`INSERT INTO exames (id,utente_id,medico_id,tipo,justificacao,data,criado_em)
      VALUES (?,?,?,?,?,?,?)`).run(id, req.params.utenteId, req.utilizador!.id, tipo, justificacao, data, now);

    registarAuditoria(req.utilizador!.id, 'REGISTAR_EXAME', 'exames', id, { tipo });
    res.status(201).json({ id, tipo, justificacao, data });
  }

  // PATCH /utentes/:utenteId/exames/:id/resultado
  registarResultado(req: Request, res: Response): void {
    const { resultado } = req.body;
    if (!resultado) { res.status(400).json({ erro: 'Resultado é obrigatório.' }); return; }
    const db = getDb();
    db.prepare('UPDATE exames SET resultado=? WHERE id=? AND utente_id=?')
      .run(resultado, req.params.id, req.params.utenteId);
    registarAuditoria(req.utilizador!.id, 'REGISTAR_RESULTADO_EXAME', 'exames', req.params.id);
    res.json({ mensagem: 'Resultado registado.' });
  }
}

