import { Request, Response } from 'express';
import { calcularCARAT } from '../services/carat.service';

export async function criarAvaliacaoCarat(req: Request, res: Response) {
  try {
    const { nome, perg1, perg2, perg3, perg4, perg5, perg6, perg7, perg8, perg9, perg10 } = req.body;

    // 1. Agrupar as respostas num array de números de 0 a 3
    const arrayRespostas = [
      Number(perg1), Number(perg2), Number(perg3), Number(perg4), Number(perg5),
      Number(perg6), Number(perg7), Number(perg8), Number(perg9), Number(perg10)
    ];

    // 2. Executar a função de cálculo que corrigimos
    const resultadoCalculado = calcularCARAT(arrayRespostas);

    // 3. Preparar o objeto final para gravar na Base de Dados
    // (Ajusta esta parte conforme o teu ORM/repositório, ex: Prisma, TypeORM ou SQL puro)
    const novoQuestionario = {
      nome: nome || 'Doente Anónimo',
      scoreTotal: resultadoCalculado.scoreTotal,
      scoreRinite: resultadoCalculado.scoreRinite,
      scoreAsma: resultadoCalculado.scoreAsma,
      controloTotal: resultadoCalculado.controloTotal, // 'CONTROLADA' ou 'NAO_CONTROLADA'
      dataCriacao: new Date().toISOString().split('T')[0] // Data atual (AAAA-MM-DD)
    };

    // Exemplo fictício de gravação na BD:
    // await db.carat.save(novoQuestionario);

    // 4. Responder ao frontend com sucesso
    return res.status(201).json({ mensagem: 'Questionário processado com sucesso!', dados: novoQuestionario });

  } catch (erro: any) {
    return res.status(400).json({ erro: erro.message || 'Erro ao processar o CARAT' });
  }
}