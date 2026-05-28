import { Request, Response } from 'express';
import { calcularCARAT } from '../services/carat.service';
import { AppDataSource } from '../database/database';
import { AvaliacaoCARAT } from '../models/carat.entity';
import { AuthRequest } from '../middleware/auth.middleware';

export async function criarAvaliacaoCarat(req: AuthRequest, res: Response) {
  try {
    const { perg1, perg2, perg3, perg4, perg5, perg6, perg7, perg8, perg9, perg10 } = req.body;

    const arrayRespostas = [
      Number(perg1), Number(perg2), Number(perg3), Number(perg4), Number(perg5),
      Number(perg6), Number(perg7), Number(perg8), Number(perg9), Number(perg10)
    ];

    const resultado = calcularCARAT(arrayRespostas);

    // Persistir na base de dados
    const repo = AppDataSource.getRepository(AvaliacaoCARAT);
    const nova = repo.create({
      utente_id:          req.user?.id ?? null,
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

    // Resposta com a chave "avaliacao" que o frontend espera
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
    const lista = await repo.find({ order: { dataCriacao: 'DESC' } });

    // Se utente, filtrar só os seus
    const filtrado = req.user?.role === 'utente'
      ? lista.filter(c => c.utente_id === req.user!.id)
      : lista;

    return res.json(filtrado.map(c => ({
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