import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isRoleOpen } from "@/lib/disclosure";
import {
  ACCESS_ACTION_ICONS,
  ACCESS_ACTION_LABELS,
  MILESTONE_KEY_LABELS,
  MILESTONE_STATUS_LABELS,
  PARTICIPATION_STATUS_LABELS,
  PROJECT_ROLE_LABELS,
  projectCode,
} from "@/lib/labels";
import { ErrorBanner } from "@/components/error-banner";
import { Icon } from "@/components/icon";
import { ConfirmForm } from "@/components/confirm-form";
import { SubmitButton } from "@/components/submit-button";
import { closeMilestoneAction } from "@/lib/actions/project-actions";
import { inviteParticipantAction } from "@/lib/actions/participation-actions";
import { approveRequestAction, rejectRequestAction } from "@/lib/actions/access-actions";
import {
  badgeAccent,
  badgeNeutral,
  badgeVerified,
  buttonAccent,
  buttonDanger,
  buttonGhost,
  buttonVerified,
  card,
  input,
  label as labelClass,
  select as selectClass,
} from "@/lib/ui";

export default async function ProjectPage({
  params,
  searchParams,
}: PageProps<"/dashboard/projects/[id]">) {
  const structurator = await requireRole(["ESTRUCTURADOR"]);
  const { id } = await params;
  const { error } = await searchParams;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      milestones: { orderBy: { sortOrder: "asc" } },
      roles: {
        include: { opensAtMilestone: true, disclosureLevels: { orderBy: { level: "asc" } } },
      },
      participations: {
        include: {
          user: true,
          projectRole: true,
          accessRequests: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { invitedAt: "desc" },
      },
      accessLogs: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 12,
      },
    },
  });

  if (!project) notFound();
  if (project.structuratorId !== structurator.id) redirect("/dashboard/projects");

  const pendingRequests = project.participations.flatMap((p) =>
    p.accessRequests.filter((r) => r.status === "PENDING").map((r) => ({ request: r, participation: p })),
  );
  const openRoles = project.roles.filter((r) => isRoleOpen(r.opensAtMilestone));

  return (
    <div className="space-y-6">
      <Link href="/dashboard/projects" className={buttonGhost}>
        ← Volver a tus proyectos
      </Link>

      <ErrorBanner message={typeof error === "string" ? error : undefined} />

      <div className={card}>
        <span className={badgeAccent}>{projectCode(project.id)}</span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>
        <p className="text-sm text-muted">{project.location}</p>
        <p className="mt-3 text-sm text-muted">{project.teaserSummary}</p>
      </div>

      {/* Hitos */}
      <section className={`space-y-4 ${card}`}>
        <h2 className="text-sm font-bold text-foreground">Hitos del proyecto</h2>
        <div className="flex flex-col gap-3">
          {project.milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-light bg-surface-sunken p-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {MILESTONE_KEY_LABELS[milestone.key]}
                  </span>
                  <span
                    className={
                      milestone.status === "CLOSED"
                        ? badgeVerified
                        : milestone.status === "ACTIVE"
                          ? badgeAccent
                          : badgeNeutral
                    }
                  >
                    {MILESTONE_STATUS_LABELS[milestone.status]}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">{milestone.closeCriteria}</p>
              </div>
              {milestone.status === "ACTIVE" && (
                <ConfirmForm
                  action={closeMilestoneAction.bind(null, milestone.id)}
                  confirmMessage="¿Cerrar este hito? Se habilitará el siguiente y los roles que dependan de él."
                >
                  <SubmitButton pendingText="Cerrando…" className={buttonAccent}>
                    <Icon name="flag" className="text-sm" /> Cerrar hito
                  </SubmitButton>
                </ConfirmForm>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Invitar */}
      <section className={`space-y-4 ${card}`}>
        <h2 className="text-sm font-bold text-foreground">Invitar a un rol</h2>
        {openRoles.length === 0 ? (
          <p className="text-xs text-muted">
            Ningún rol está habilitado todavía: cierra el hito de viabilidad para abrir la puerta al inversor.
          </p>
        ) : (
          <form action={inviteParticipantAction.bind(null, project.id)} className="flex flex-wrap items-end gap-3">
            <label className="flex-1 min-w-[220px]">
              <span className={labelClass}>Email de la persona a invitar</span>
              <input type="email" name="email" required className={input} placeholder="nombre@empresa.com" />
            </label>
            <label>
              <span className={labelClass}>Rol</span>
              <select name="roleType" className={selectClass}>
                {openRoles.map((r) => (
                  <option key={r.id} value={r.roleType}>
                    {PROJECT_ROLE_LABELS[r.roleType]}
                  </option>
                ))}
              </select>
            </label>
            <SubmitButton pendingText="Invitando…" className={buttonAccent}>
              <Icon name="mail" className="text-sm" /> Invitar
            </SubmitButton>
          </form>
        )}
        <p className="text-[11px] text-muted-light">
          Solo se puede invitar a un email que ya tenga cuenta en Umbral (sin invitación a alguien sin
          cuenta todavía, en este MVP).
        </p>
      </section>

      {/* Solicitudes pendientes */}
      <section className={`space-y-4 ${card}`}>
        <h2 className="text-sm font-bold text-foreground">Solicitudes de nivel pendientes</h2>
        {pendingRequests.length === 0 ? (
          <p className="text-xs text-muted">Sin solicitudes pendientes.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingRequests.map(({ request, participation }) => (
              <div key={request.id} className="rounded-lg border-l-2 border-accent bg-surface-sunken p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {participation.user.name} · {PROJECT_ROLE_LABELS[participation.projectRole.roleType]}
                  </span>
                  <span className="text-xs text-muted">pide nivel {request.requestedLevel}</span>
                </div>
                <p className="mt-1.5 text-sm italic text-foreground">&ldquo;{request.message}&rdquo;</p>
                <div className="mt-3 flex gap-2">
                  <form action={approveRequestAction.bind(null, request.id)}>
                    <SubmitButton pendingText="Aprobando…" className={buttonVerified}>
                      <Icon name="check_circle" className="text-sm" /> Aprobar
                    </SubmitButton>
                  </form>
                  <ConfirmForm
                    action={rejectRequestAction.bind(null, request.id)}
                    confirmMessage="¿Rechazar esta solicitud de nivel?"
                  >
                    <SubmitButton pendingText="Rechazando…" className={buttonDanger}>
                      Rechazar
                    </SubmitButton>
                  </ConfirmForm>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Participaciones */}
        <div className="xl:col-span-8">
          <section className={`space-y-4 ${card}`}>
            <h2 className="text-sm font-bold text-foreground">Participantes</h2>
            {project.participations.length === 0 ? (
              <p className="text-xs text-muted">Todavía no has invitado a nadie.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {project.participations.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-light bg-surface-sunken p-3"
                  >
                    <div>
                      <span className="text-sm font-semibold text-foreground">{p.user.name}</span>
                      <span className="ml-2 text-xs text-muted">
                        {PROJECT_ROLE_LABELS[p.projectRole.roleType]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={badgeNeutral}>{PARTICIPATION_STATUS_LABELS[p.status]}</span>
                      <span className={badgeAccent}>Nivel {p.currentLevel}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Log de auditoría */}
        <aside className="xl:col-span-4">
          <div className={`flex flex-col gap-4 ${card}`}>
            <h3 className="text-sm font-bold text-foreground">Registro de actividad</h3>
            {project.accessLogs.length === 0 ? (
              <p className="text-xs text-muted">Sin actividad todavía.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {project.accessLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Icon name={ACCESS_ACTION_ICONS[log.action]} className="text-sm" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-foreground">
                        {ACCESS_ACTION_LABELS[log.action]}
                      </span>
                      <p className="mt-0.5 text-xs text-muted">
                        <span className="font-medium text-foreground">{log.user.name}</span>
                        {log.level != null && ` · nivel ${log.level}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
