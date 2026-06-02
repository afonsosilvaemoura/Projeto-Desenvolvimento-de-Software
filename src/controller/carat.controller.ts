import { Response } from 'express';
import { calcularCARAT } from '../services/carat.service';
import { AppDataSource } from '../database/database';
import { AvaliacaoCARAT } from '../models/carat.entity';
import { Utente } from '../models/utente.entity';
import { AuthRequest } from '../middleware/auth.middleware';
import { In } from 'typeorm';

export async function criarAvaliacaoCarat(req: AuthRequest, res: Response) {
  try {
    const { perg1, perg2, perg3, perg4, perg5, perg6, perg7, perg8, perg9, perg10, utente_id } = req.body;

    const arrayRespostas = [
      Number(perg1), Number(perg2), Number(perg3), Number(perg4), Number(perg5),
      Number(perg6), Number(perg7), Number(perg8), Number(perg9), Number(perg10)
    ];

    const resultado = calcularCARAT(arrayRespostas);
    const repo = AppDataSource.getRepository(AvaliacaoCARAT);

    let targetUtenteId: number | null = null;
    let medicoNome: string | null = null;

    if (req.user?.role === 'medico') {
      const utenteId = Number(utente_id ?? 0);
      if (!utenteId) {
        return res.status(400).json({ erro: 'ID do utente obrigatório para médicos.' });
      }
      const utente = await AppDataSource.getRepository(Utente).findOne({ where: { id: utenteId } });
      if (!utente) {
        return res.status(404).json({ erro: 'Utente não encontrado.' });
      }
      if (utente.medico_id !== req.user.id) {
        return res.status(403).json({ erro: 'Utente não está atribuído a este médico.' });
      }
      targetUtenteId = utente.id;
      medicoNome = req.user.username;
    } else if (req.user?.role === 'utente') {
      targetUtenteId = req.user.id;
    } else {
      return res.status(403).json({ erro: 'Sem autorização para criar avaliação CARAT.' });
    }

    const nova = repo.create({
      utente_id:          targetUtenteId,
      medico_nome:        medicoNome,
      respostas:          JSON.stringify(arrayRespostas),
      scoreTotal:         resultado.scoreTotal,
      scoreRinite:        resultado.scoreRinite,
      scoreAsma:          resultado.scoreAsma,
      nivelControlo:      resultado.controloTotal,
      recomendacao:       resultado.controloTotal === 'CONTROLADA'
                            ? 'Controlado — próxima avaliação em 12 semanas.'
                            : resultado.scoreTotal > 16
                              ? 'Vigiar — marque consulta em 4 semanas.'
                              : 'Urgente — consulte o médico com brevidade.',
      proximoPassoSemanas: resultado.controloTotal === 'CONTROLADA' ? 12 : resultado.scoreTotal > 16 ? 4 : 2,
      anonima:            false,
      dataCriacao:        new Date(),
    });
    const guardado = await repo.save(nova);

    return res.status(201).json({
      mensagem: 'Questionário CARAT processado com sucesso!',
      avaliacao: {
        id:            guardado.id,
        nome:          req.user?.username ?? 'Doente',
        scoreTotal:    resultado.scoreTotal,
        scoreRinite:   resultado.scoreRinite,
        scoreAsma:     resultado.scoreAsma,
        controloTotal: resultado.controloTotal,
        dataCriacao:   guardado.dataCriacao,
      }
    });
  } catch (erro: any) {
    return res.status(400).json({ erro: erro.message || 'Erro ao processar o CARAT' });
  }
}

export async function listarAvaliacoesCarat(req: AuthRequest, res: Response) {
  try {
    const repo  = AppDataSource.getRepository(AvaliacaoCARAT);

    if (req.user?.role === 'utente') {
      const lista = await repo.find({ where: { utente_id: req.user.id }, order: { dataCriacao: 'DESC' } });
      return res.json(lista.map(c => ({
        id:            c.id,
        nome:          'Doente',
        scoreTotal:    c.scoreTotal,
        scoreRinite:   c.scoreRinite,
        scoreAsma:     c.scoreAsma,
        controloTotal: c.nivelControlo,
        dataCriacao:   c.dataCriacao,
      })));
    }

    if (req.user?.role === 'medico') {
      const utentes = await AppDataSource.getRepository(Utente).find({ where: { medico_id: req.user.id } });
      const ids = utentes.map(u => u.id);
      if (!ids.length) return res.json([]);
      const lista = await repo.find({ where: { utente_id: In(ids) }, order: { dataCriacao: 'DESC' } });
      return res.json(lista.map(c => ({
        id:            c.id,
        nome:          c.medico_nome ?? 'Doente',
        scoreTotal:    c.scoreTotal,
        scoreRinite:   c.scoreRinite,
        scoreAsma:     c.scoreAsma,
        controloTotal: c.nivelControlo,
        dataCriacao:   c.dataCriacao,
      })));
    }

    const lista = await repo.find({ order: { dataCriacao: 'DESC' } });
    return res.json(lista.map(c => ({
      id:            c.id,
      nome:          'Doente',
      scoreTotal:    c.scoreTotal,
      scoreRinite:   c.scoreRinite,
      scoreAsma:     c.scoreAsma,
      controloTotal: c.nivelControlo,
      dataCriacao:   c.dataCriacao,
    })));
  } catch (erro: any) {
    return res.status(500).json({ erro: erro.message });
  }
}