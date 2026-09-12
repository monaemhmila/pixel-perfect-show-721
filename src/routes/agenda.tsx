import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  appointments as seedAppointments,
  doctors,
  doctorById,
  fullName,
  initials,
  patientById,
  TODAY,
} from "@/data/mock";
import {
  AppointmentStatusBadge,
  EmptyState,
  PageHeader,
  PatientAvatar,
  SectionCard,
} from "@/components/shared/ui-kit";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { addDays, formatLongDate, formatShortDate, money, startOfWeek } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/types";

export const Route = createFileRoute("/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda — Dental AI" },
      {
        name: "description",
        content:
          "Agenda du cabinet en vue jour et semaine, avec créneaux libres, absences et rendez-vous créés par l'IA.",
      },
      { property: "og:title", content: "Agenda — Dental AI" },
      {
        property: "og:description",
        content: "Vue jour et semaine des rendez-vous du cabinet.",
      },
    ],
  }),
  component: AgendaPage,
});

const HOURS = [
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

function AgendaPage() {
  const [view, setView] = useState<"day" | "week">("day");
  const [day, setDay] = useState(TODAY);
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Appointment | null>(null);

  const weekStart = startOfWeek(day);
  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));

  const visible = useMemo(
    () =>
      seedAppointments.filter(
        (a) => doctorFilter === "all" || a.doctorId === doctorFilter,
      ),
    [doctorFilter],
  );

  const dayAppts = visible
    .filter((a) => a.date === day)
    .sort((a, b) => a.time.localeCompare(b.time));

  const step = view === "day" ? 1 : 7;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Agenda"
        subtitle={view === "day" ? formatLongDate(day) : `Semaine du ${formatShortDate(weekStart)}`}
        actions={
          <>
            <div className="panel flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDay(addDays(day, -step))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDay(TODAY)}>
                Aujourd'hui
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setDay(addDays(day, step))}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week")}>
              <TabsList>
                <TabsTrigger value="day">Jour</TabsTrigger>
                <TabsTrigger value="week">Semaine</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button onClick={() => toast.success("Nouveau rendez-vous ajouté (démo locale)")}>
              <Plus className="size-4" /> Rendez-vous
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={doctorFilter === "all" ? "default" : "outline"}
          onClick={() => setDoctorFilter("all")}
        >
          Tous les praticiens
        </Button>
        {doctors.map((d) => (
          <Button
            key={d.id}
            size="sm"
            variant={doctorFilter === d.id ? "default" : "outline"}
            onClick={() => setDoctorFilter(d.id)}
          >
            {d.name}
          </Button>
        ))}
      </div>

      {view === "day" ? (
        <SectionCard title="Journée" description={`${dayAppts.length} rendez-vous`} bodyClassName="p-0">
          {dayAppts.length === 0 ? (
            <EmptyState title="Aucun rendez-vous" description="Cette journée est libre." />
          ) : (
            <ul className="divide-y divide-border">
              {HOURS.map((h) => {
                const a = dayAppts.find((x) => x.time === h);
                if (!a)
                  return (
                    <li key={h} className="flex items-center gap-4 px-5 py-2.5">
                      <span className="num w-12 text-xs text-muted-foreground">{h}</span>
                      <span className="text-xs text-muted-foreground">Créneau libre</span>
                    </li>
                  );
                const p = patientById(a.patientId)!;
                return (
                  <li key={h}>
                    <button
                      onClick={() => setSelected(a)}
                      className="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-muted/60"
                    >
                      <span className="num w-12 text-sm font-semibold">{h}</span>
                      <PatientAvatar initials={initials(p)} id={p.id} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {fullName(p)}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {a.treatment} · {a.durationMin} min · {doctorById(a.doctorId)?.name}
                        </span>
                      </span>
                      {a.createdByAi && (
                        <span className="hidden items-center gap-1 rounded-full bg-ai-soft px-2 py-0.5 text-[11px] font-medium text-ai sm:inline-flex">
                          <Sparkles className="size-3" /> IA
                        </span>
                      )}
                      <AppointmentStatusBadge status={a.status} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {weekDays.map((d) => {
            const list = visible
              .filter((a) => a.date === d)
              .sort((a, b) => a.time.localeCompare(b.time));
            return (
              <SectionCard
                key={d}
                title={formatLongDate(d)}
                description={`${list.length} rendez-vous`}
                bodyClassName="p-0"
                className={cn(d === TODAY && "ring-1 ring-accent")}
              >
                {list.length === 0 ? (
                  <p className="px-5 py-6 text-xs text-muted-foreground">Journée libre.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {list.map((a) => {
                      const p = patientById(a.patientId)!;
                      return (
                        <li key={a.id}>
                          <button
                            onClick={() => setSelected(a)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/60"
                          >
                            <span className="num w-10 text-xs font-semibold">{a.time}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13px] font-medium">
                                {fullName(p)}
                              </span>
                              <span className="block truncate text-[11px] text-muted-foreground">
                                {a.treatment}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </SectionCard>
            );
          })}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.treatment}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <PatientAvatar
                    initials={initials(patientById(selected.patientId)!)}
                    id={selected.patientId}
                  />
                  <div>
                    <Link
                      to="/patients/$id"
                      params={{ id: selected.patientId }}
                      className="text-sm font-medium hover:underline"
                    >
                      {fullName(patientById(selected.patientId)!)}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {patientById(selected.patientId)!.phone}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <AppointmentStatusBadge status={selected.status} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium">{formatLongDate(selected.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Heure</p>
                    <p className="num font-medium">
                      {selected.time} ({selected.durationMin} min)
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Praticien</p>
                    <p className="font-medium">{doctorById(selected.doctorId)?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valeur</p>
                    <p className="num font-medium">{money(selected.value ?? 0)}</p>
                  </div>
                </div>
                <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                  {selected.notes}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      toast.success("Rappel WhatsApp envoyé");
                      setSelected(null);
                    }}
                  >
                    Envoyer un rappel
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/conversations">Ouvrir la conversation</Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
