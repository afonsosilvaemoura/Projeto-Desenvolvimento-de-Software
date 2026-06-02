import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { interpretarLabel, interpretarTone } from "@/lib/carat";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip, CartesianGrid } from "recharts";
import { Bell, Activity, Users, Pill } from "lucide-react";
import { Link } from "@tanstack/react-router";

function getAuthHeaders() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const Route = createFileRoute("/app/dashboard")({ component: Dashboard });

function Stat({ label, value, icon: Icon, tone = "primary" }: any) {
  const map: Record<string,string> = { primary: "bg-primary-soft text-primary", warning:"bg-warning/15 text-warning-foreground", destructive:"bg-destructive/10 text-destructive", success:"bg-success/15 text-success" };
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={`grid h-9 w-9 place-items-center rounded-lg ${map[tone]}`}><Icon className="h-4 w-4" /></div>
      </div>
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}

function Dashboard() {
  const { user, role, profile } = useAuth();

  if (role === "utente") return <UtenteDash userId={user!.id} nome={profile?.nome ?? ""} />;
  if (role === "medico") return <MedicoDash userId={user!.id} nome={profile?.nome ?? ""} />;
  return <AdminDash />;
}

function UtenteDash({ userId, nome }: { userId: string; nome: string }) {
  const { data: dashboard = { carats: [], alertas: [], medicacoes: [] } } = useQuery({
    queryKey: ["dashboard-utente", userId],
    queryFn: async () => {
      const res = await fetch(`/dashboard/utente/${userId}`, { headers: getAuthHeaders() });
      if (!res.ok) return { carats: [], alertas: [], medicacoes: [] };
      return await res.json();
    },
  });

  const avaliacoes = dashboard.carats ?? [];
  const alertas = dashboard.alertas ?? [];
  const medicacoes = dashboard.medicacoes ?? [];

  const ultima = avaliacoes[avaliacoes.length - 1];
  const chartData = avaliacoes.map((a) => ({ data: new Date(a.created_at).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" }), score: a.score_total }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Olá, {nome.split(" ")[0]}</h1>
        <p className="text-muted-foreground">Eis o seu estado atual de saúde respiratória.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Score CARAT atual" value={ultima?.score_total ?? "—"} icon={Activity} tone={interpretarTone(ultima?.interpretacao) as any} />
        <Stat label="Avaliações" value={avaliacoes.length} icon={Activity} />
        <Stat label="Alertas ativos" value={alertas.length} icon={Bell} tone={alertas.length ? "destructive" : "success"} />
        <Stat label="Medicações ativas" value={medicacoes.length} icon={Pill} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Evolução CARAT</h2>
              <p className="text-xs text-muted-foreground">Linha vermelha = limiar de controlo (24)</p>
            </div>
            <Link to="/app/carat" className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">Nova avaliação</Link>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.02 160)" />
                <XAxis dataKey="data" tick={{ fontSize: 12 }} />
                <YAxis domain={[0,30]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <ReferenceLine y={24} stroke="oklch(0.58 0.21 25)" strokeDasharray="4 4" label={{ value: "Limiar", fontSize: 11, fill: "oklch(0.58 0.21 25)" }} />
                <Line type="monotone" dataKey="score" stroke="oklch(0.62 0.14 160)" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Estado atual</h2>
          {ultima ? (
            <div className="mt-4">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${ultima.interpretacao === "CONTROLADA" ? "bg-success/15 text-success" : ultima.interpretacao === "PARCIALMENTE_CONTROLADA" ? "bg-warning/15 text-warning-foreground" : "bg-destructive/10 text-destructive"}`}>
                {interpretarLabel(ultima.interpretacao)}
              </span>
              <p className="mt-4 text-sm">{ultima.recomendacoes}</p>
              <p className="mt-3 text-xs text-muted-foreground"><strong>Próximo passo:</strong> {ultima.proximo_passo}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Ainda não tem avaliações. <Link to="/app/carat" className="text-primary underline">Preencher CARAT</Link>.</p>
          )}
        </div>
      </div>

      {alertas.length > 0 && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <h2 className="font-display text-lg font-semibold text-destructive">Alertas ativos</h2>
          <ul className="mt-3 space-y-2">
            {alertas.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 rounded-lg bg-card p-3 text-sm">
                <div><p className="font-medium">{a.tipo}</p><p className="text-xs text-muted-foreground">{a.motivo}</p></div>
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">{a.prioridade}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function MedicoDash({ userId, nome }: { userId: string; nome: string }) {
  const { data: dashboard = { utentes: [], alertas: [] } } = useQuery({
    queryKey: ["dashboard-medico", userId],
    queryFn: async () => {
      const res = await fetch(`/dashboard/medico/${userId}`, { headers: getAuthHeaders() });
      if (!res.ok) return { utentes: [], alertas: [] };
      return await res.json();
    },
  });

  const utentes = dashboard.utentes ?? [];
  const alertas = dashboard.alertas ?? [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Bom dia, {nome.split(" ").slice(0,2).join(" ")}</h1>
        <p className="text-muted-foreground">Visão geral dos seus utentes e alertas pendentes.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Utentes atribuídos" value={utentes.length} icon={Users} />
        <Stat label="Alertas pendentes" value={alertas.length} icon={Bell} tone={alertas.length ? "destructive" : "success"} />
        <Stat label="Alertas críticos" value={alertas.filter((a:any) => a.prioridade === "CRITICA").length} icon={Bell} tone="destructive" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold">Os meus utentes</h2>
        <div className="mt-4 divide-y divide-border">
          {utentes.map((u: any) => (
            <Link key={u.id} to="/app/utentes/$id" params={{ id: u.user_id }} className="flex items-center justify-between py-3 hover:bg-accent">
              <div>
                <p className="font-medium">{u.profiles?.nome ?? "—"}</p>
                <p className="text-xs text-muted-foreground">Nº utente: {u.numero_utente}</p>
              </div>
              <span className="text-xs font-semibold text-primary">Abrir →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminDash() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch('/dashboard/admin/stats', { headers: getAuthHeaders() });
      if (!res.ok) return { utentes: 0, medicos: 0, avaliacoes: 0, alertas: 0 };
      return await res.json();
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Painel de Administração</h1>
        <p className="text-muted-foreground">Visão global do sistema SaudiNoB.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Utentes" value={stats?.utentes ?? "—"} icon={Users} />
        <Stat label="Médicos" value={stats?.medicos ?? "—"} icon={Users} />
        <Stat label="Avaliações CARAT" value={stats?.avaliacoes ?? "—"} icon={Activity} />
        <Stat label="Alertas pendentes" value={stats?.alertas ?? "—"} icon={Bell} tone={stats?.alertas ? "destructive" : "success"} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/app/utentes" className="rounded-2xl border border-border bg-card p-5 hover:bg-accent"><Users className="h-5 w-5 text-primary" /><p className="mt-3 font-semibold">Gerir Utentes</p><p className="text-xs text-muted-foreground">Criar, atualizar, atribuir médico</p></Link>
        <Link to="/app/medicos" className="rounded-2xl border border-border bg-card p-5 hover:bg-accent"><Users className="h-5 w-5 text-primary" /><p className="mt-3 font-semibold">Gerir Médicos</p><p className="text-xs text-muted-foreground">Especialidades, cédula, ativação</p></Link>
        <Link to="/app/parametros" className="rounded-2xl border border-border bg-card p-5 hover:bg-accent"><Activity className="h-5 w-5 text-primary" /><p className="mt-3 font-semibold">Parâmetros</p><p className="text-xs text-muted-foreground">Limiares de alerta CARAT</p></Link>
      </div>
    </div>
  );
}