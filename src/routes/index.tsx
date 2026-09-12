import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  HeartPulse,
  MessagesSquare,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import {
  appointments,
  conversations as seedConversations,
  doctorById,
  fullName,
  initials,
  patients,
  patientById,
  recoveryFunnel,
  recoverySummary,
  TODAY,
} from "@/data/mock";
import {
  AIStatusBadge,
  AppointmentStatusBadge,
  PageHeader,
  PatientAvatar,
  PriorityBadge,
  ProgressBar,
  SectionCard,
  StatCard,
} from "@/components/shared/ui-kit";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAppState } from "@/hooks/use-app-state";
import { formatLongDate, money, relativeDay } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — Dental AI" },
      {
        name: "description",
        content:
          "Vue d'ensemble du cabinet : rendez-vous du jour, patients à récupérer, revenus récupérés et activité de l'assistant IA.",
      },
      { property: "og:title", content: "Tableau de bord — Dental AI" },
      {
        property: "og:description",
        content: "Vue d'ensemble du cabinet et de la récupération patients.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { aiGlobalActive, setAiGlobalActive, slots, conversations } = useAppState();

  const todayAppts = appointments
    .filter((a) => a.date === TODAY)
    .sort((a, b) => a.time.localeCompare(b.time));

  const toRecover = patients
    .filter((p) => p.recoveryReason && p.priority === "high")
    .slice(0, 5);

  const needsHuman = conversations.filter((c) => c.needsHuman);
  const openSlots = slots.filter((s) => !s.filled);
  const recoveredValue = 4850;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title={`Bonjour Sarah 👋`}
        subtitle={formatLongDate(TODAY)}
        actions={
          <>
            <div className="panel flex items-center gap-2.5 px-3 py-2">
              <Sparkles className="size-4 text-ai" />
              <span className="text-[13px] font-medium">Assistant IA</span>
              <Switch
                checked={aiGlobalActive}
                onCheckedChange={(v) => {
                  setAiGlobalActive(v);
                  toast.success(v ? "Assistant IA activé" : "Assistant IA mis en pause");
                }}
              />
            </div>
            <Button asChild>
              <Link to="/recovery">Lancer une récupération</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Rendez-vous aujourd'hui"
          value={todayAppts.length}
          hint={`${todayAppts.filter((a) => a.status === "confirmed").length} confirmés`}
          tone="accent"
          icon={CalendarDays}
        />
        <StatCard
          label="Patients à récupérer"
          value={recoverySummary.toRecover}
          trend={12}
          hint="ce mois"
          tone="warning"
          icon={HeartPulse}
        />
        <StatCard
          label="Revenus récupérés"
          value={money(recoveredValue)}
          trend={18}
          hint="30 derniers jours"
          tone="success"
          icon={Wallet}
        />
        <StatCard
          label="Conversations actives"
          value={conversations.length}
          hint={`${needsHuman.length} à traiter`}
          tone="ai"
          icon={MessagesSquare}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Agenda du jour"
          description={`${todayAppts.length} rendez-vous planifiés`}
          bodyClassName="p-0"
          actions={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/agenda">Voir l'agenda</Link>
            </Button>
          }
        >
          <ul className="divide-y divide-border">
            {todayAppts.slice(0, 8).map((a) => {
              const p = patientById(a.patientId)!;
              return (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="num w-12 shrink-0 text-sm font-semibold text-foreground">
                    {a.time}
                  </span>
                  <PatientAvatar initials={initials(p)} id={p.id} size="sm" />
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/patients/$id"
                      params={{ id: p.id }}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {fullName(p)}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {a.treatment} · {doctorById(a.doctorId)?.name}
                    </p>
                  </div>
                  {a.createdByAi && <AIStatusBadge active label="Pris par l'IA" />}
                  <AppointmentStatusBadge status={a.status} />
                </li>
              );
            })}
          </ul>
        </SectionCard>

        <SectionCard
          title="Priorités IA"
          description="Patients à contacter en premier"
          bodyClassName="p-0"
          actions={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/recovery">Tout voir</Link>
            </Button>
          }
        >
          <ul className="divide-y divide-border">
            {toRecover.map((p) => (
              <li key={p.id} className="px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <PatientAvatar initials={initials(p)} id={p.id} size="sm" />
                  <Link
                    to="/patients/$id"
                    params={{ id: p.id }}
                    className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
                  >
                    {fullName(p)}
                  </Link>
                  {p.priority && <PriorityBadge priority={p.priority} />}
                </div>
                <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
                  {p.aiRecommendation}
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard title="Entonnoir de récupération" description="30 derniers jours">
          <ul className="space-y-3.5">
            {recoveryFunnel.map((s) => (
              <li key={s.stage}>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">{s.stage}</span>
                  <span className="num font-semibold">{s.value}</span>
                </div>
                <div className="mt-1.5">
                  <ProgressBar value={(s.value / recoveryFunnel[0].value) * 100} tone="ai" />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="Créneaux libres"
          description="À remplir avec la liste d'attente"
          bodyClassName="p-0"
          actions={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/waitlist">Liste d'attente</Link>
            </Button>
          }
        >
          <ul className="divide-y divide-border">
            {openSlots.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                <span className="flex flex-col">
                  <span className="num text-sm font-semibold">{s.time}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {relativeDay(s.date)}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">
                    {doctorById(s.doctorId)?.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {s.matchIds.length} patients compatibles · {money(s.value)}
                  </span>
                </span>
                <Button size="sm" variant="secondary" asChild>
                  <Link to="/waitlist">Remplir</Link>
                </Button>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="Activité de l'IA"
          description="Dernières 24 heures"
          bodyClassName="p-0"
          actions={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/conversations">Boîte de réception</Link>
            </Button>
          }
        >
          <ul className="divide-y divide-border">
            {seedConversations.slice(0, 6).map((c) => {
              const p = patientById(c.patientId)!;
              const last = c.messages[c.messages.length - 1];
              return (
                <li key={c.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{fullName(p)}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {c.updatedAt}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {last.author === "patient" ? "Patient : " : "IA : "}
                    {last.text}
                  </p>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Impact estimé" description="Simulation basée sur vos données locales">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-success-soft text-success">
              <TrendingUp className="size-4" />
            </span>
            <div>
              <p className="num text-xl font-semibold">{money(18400)}</p>
              <p className="text-xs text-muted-foreground">
                Potentiel restant à récupérer sur 84 patients
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-ai-soft text-ai">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="num text-xl font-semibold">231</p>
              <p className="text-xs text-muted-foreground">
                Messages traités automatiquement ce mois
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <CalendarDays className="size-4" />
            </span>
            <div>
              <p className="num text-xl font-semibold">11</p>
              <p className="text-xs text-muted-foreground">
                Rendez-vous créés par l'IA ce mois
              </p>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
