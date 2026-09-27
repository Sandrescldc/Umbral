import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { effectiveLevel } from "@/lib/disclosure";
import { PARTICIPATION_STATUS_LABELS, PROJECT_ROLE_LABELS, projectCode } from "@/lib/labels";
import { ErrorBanner } from "@/components/error-banner";
import { Icon } from "@/components/icon";
import { ConfirmForm } from "@/components/confirm-form";
import { SubmitButton } from "@/components/submit-button";
import { acceptNdaAction, withdrawParticipationAction } from "@/lib/actions/participation-actions";
import { requestLevelAction } from "@/lib/actions/access-actions";
import {
  badgeAccent,
  badgeNeutral,
  buttonAccent,
  buttonDanger,
  buttonGhost,
  buttonVerified,
  card,
  label as labelClass,
  textarea,
} from "@/lib/ui";

export default async function ParticipationPage({
  params,
  searchParams,
}: PageProps<"/participations/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const { error } = await searchParams;

  const participation = await prisma.participation.findUnique({
    where: { id },
    include: {
      project: true,
      projectRole: { include: { disclosureLevels: { orderBy: { level: "asc" } } } },
      accessRequests: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!participation) notFound();
  if (participation.userId !== user.id) redirect("/dashboard/participations");

  const level = effectiveLevel(participation);
  const levels = participation.projectRole.disclosureLevels;
  const maxLevel = Math.max(0, ...levels.map((l) => l.level));
  const unlocked = levels.filter((l) => l.level <= level);
  const pendingRequest = participation.accessRequests.find((r) => r.status === "PENDING");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/dashboard/participations" className={buttonGhost}>
        ← Volver a mis participaciones
      </Link>

      <ErrorBanner message={typeof error === "string" ? error : undefined} />

      <div className={card}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className={badgeAccent}>{projectCode(participation.project.id)}</span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">{participation.project.name}</h1>
            <p className="text-sm text-muted">
              {participation.project.location} · {PROJECT_ROLE_LABELS[participation.projectRole.roleType]}
            </p>
          </div>
          <span className={badgeNeutral}>{PARTICIPATION_STATUS_LABELS[participation.status]}</span>
        </div>
        <p className="mt-3 text-sm text-muted">{participation.project.teaserSummary}</p>
      </div>

      {participation.status === "INVITED" && (
        <div className={`space-y-4 ${card}`}>
          <h2 className="text-sm font-bold text-foreground">Acuerdo de confidencialidad</h2>
          <p className="text-sm text-muted">
            Antes de ver más información de este proyecto tienes que aceptar el acuerdo de
            confidencialidad (NDA). El estructurador verá cuándo lo aceptas.
          </p>
          <form action={acceptNdaAction.bind(null, participation.id)}>
            <SubmitButton pendingText="Firmando…" className={buttonVerified}>
              <Icon name="draw" className="text-sm" /> Aceptar NDA y continuar
            </SubmitButton>
          </form>
        </div>
      )}

      {participation.status === "ACTIVE" && (
        <>
          <div className={`space-y-4 ${card}`}>
            <h2 className="text-sm font-bold text-foreground">Información disponible en tu nivel actual</h2>
            {unlocked.length === 0 ? (
              <p className="text-xs text-muted">Solo el resumen anónimo del proyecto, arriba.</p>
            ) : (
              <dl className="space-y-3">
                {unlocked.map((l) => (
                  <div key={l.id} className="rounded-lg border border-border-light bg-surface-sunken p-3">
                    <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-light">
                      <Icon name="lock_open" className="text-verified" /> Nivel {l.level} · {l.label}
                    </dt>
                    <dd className="mt-1 text-sm text-foreground">{l.description}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <div className={`space-y-4 ${card}`}>
            <h2 className="text-sm font-bold text-foreground">Subir de nivel</h2>
            {level >= maxLevel ? (
              <p className="text-xs text-muted">Ya tienes el nivel máximo de tu rol en este proyecto.</p>
            ) : pendingRequest ? (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-accent">
                <Icon name="schedule" className="text-sm" /> Solicitud de nivel {pendingRequest.requestedLevel} pendiente
                de respuesta del estructurador.
              </p>
            ) : (
              <form action={requestLevelAction.bind(null, participation.id)} className="space-y-3">
                <label>
                  <span className={labelClass}>¿Por qué necesitas el siguiente nivel?</span>
                  <textarea name="message" required rows={3} className={textarea} />
                </label>
                <SubmitButton pendingText="Enviando…" className={buttonAccent}>
                  <Icon name="vpn_key" className="text-sm" /> Solicitar nivel {level + 1}
                </SubmitButton>
              </form>
            )}
          </div>
        </>
      )}

      {(participation.status === "ACTIVE" || participation.status === "INVITED") && (
        <ConfirmForm
          action={withdrawParticipationAction.bind(null, participation.id)}
          confirmMessage="¿Seguro que quieres retirarte de este proyecto? Perderás el acceso concedido."
        >
          <SubmitButton pendingText="Retirando…" className={buttonDanger}>
            Retirarme del proyecto
          </SubmitButton>
        </ConfirmForm>
      )}
    </div>
  );
}
