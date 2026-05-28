import { Router, Response } from 'express';
import { AppDataSource }  from '../database/database';
import { Alerta }         from '../models/alerta.entity';
import { LimiarAlerta }   from '../models/limiarAlerta.entity';
import { AvaliacaoCARAT } from '../models/carat.entity';
import { authMiddleware, authorize, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const adminOnly = [authMiddleware, authorize(['administrador'])];

// GET /admin/alertas
router.get('/alertas', ...adminOnly, async (_req, res: Response) => {
  try {
    const alertas = await AppDataSource.getRepository(Alerta).find({ order: { dataCriacao: 'DESC' } });
    return res.json(alertas);
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

// GET /admin/limiar
router.get('/limiar', ...adminOnly, async (_req, res: Response) => {
  try {
    let limiar = await AppDataSource.getRepository(LimiarAlerta).findOne({ where: {} as any });
    if (!limiar) {
      limiar = await AppDataSource.getRepository(LimiarAlerta).save(
        AppDataSource.getRepository(LimiarAlerta).create({
          scoreMinimo: 24, deterioracaoPontos: 3, dataAtualizacao: new Date()
        })
      );
    }
    return res.json(limiar);
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

// PUT /admin/limiar
router.put('/limiar', ...adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { scoreMinimo, deterioracaoPontos } = req.body;
    const repo = AppDataSource.getRepository(LimiarAlerta);
    let limiar = await repo.findOne({ where: {} as any });
    if (!limiar) limiar = repo.create({ scoreMinimo: 24, deterioracaoPontos: 3, dataAtualizacao: new Date() });
    limiar.scoreMinimo       = Number(scoreMinimo);
    limiar.deterioracaoPontos= Number(deterioracaoPontos);
    limiar.dataAtualizacao   = new Date();
    await repo.save(limiar);
    return res.json({ mensagem: 'Limiar atualizado.', limiar });
  } catch (e: any) { return res.status(400).json({ erro: e.message }); }
});

// GET /admin/dashboard/:utenteId — informação clínica + CARAT
router.get('/dashboard/:utenteId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.utenteId);
    // Utente só pode ver os seus próprios dados
    if (req.user?.role === 'utente' && req.user.id !== id) {
      return res.status(403).json({ erro: 'Acesso negado.' });
    }
    const { Utente } = await import('../models/utente.entity');
    const utente = await AppDataSource.getRepository(Utente).findOne({ where: { id } });
    if (!utente) return res.status(404).json({ erro: 'Utente não encontrado.' });

    const carats = await AppDataSource.getRepository(AvaliacaoCARAT).find({
      where: { utente_id: id }, order: { dataCriacao: 'DESC' }
    });

    const { Exame } = await import('../models/exame.entity');
    const exames = await AppDataSource.getRepository(Exame).find({ where: { utente_id: id } });

    return res.json({
      utente: {
        id: utente.id, nome: utente.nome, sexo: utente.sexo, idade: utente.idade,
        diagnostico_asma: utente.diagnostico_asma,
        data_primeira_consulta: utente.data_primeira_consulta,
        medico_id: utente.medico_id
      },
      carats: carats.map(c => ({
        id: c.id, scoreTotal: c.scoreTotal, scoreRinite: c.scoreRinite,
        scoreAsma: c.scoreAsma, controloTotal: c.nivelControlo, dataCriacao: c.dataCriacao
      })),
      exames,
      ultimoCarat: carats.length ? {
        scoreTotal: carats[0].scoreTotal, scoreRinite: carats[0].scoreRinite,
        scoreAsma: carats[0].scoreAsma, controloTotal: carats[0].nivelControlo
      } : null,
      totalExames: exames.length,
      totalCarats: carats.length
    });
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

export default router;

/*import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app/medicos")({ component: Page });

function Page() {
  const { data = [] } = useQuery({
    queryKey: ["medicos"],
    queryFn: async () => (await supabase.from("medicos").select("*, profiles:profiles!medicos_user_id_fkey(nome,email)")).data ?? [],
  });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Médicos</h1>
      <div className="rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Especialidade</th><th className="px-4 py-3">Cédula</th><th className="px-4 py-3">Estado</th></tr></thead>
          <tbody className="divide-y divide-border">
            {data.map((m:any)=>(
              <tr key={m.id}><td className="px-4 py-3 font-medium">{m.profiles?.nome}</td><td className="px-4 py-3">{m.especialidade}</td><td className="px-4 py-3">{m.cedula_profissional}</td><td className="px-4 py-3">{m.ativo ? <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">ativo</span> : <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">inativo</span>}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
*/