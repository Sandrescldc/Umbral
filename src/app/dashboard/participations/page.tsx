import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PARTICIPATION_STATUS_LABELS, PROJECT_ROLE_LABELS, projectCode } from "@/lib/labels";
import { badgeAccent, badgeNeutral, card } from "@/lib/ui";

export default async function ParticipationsPage() {
  const user = await requireUser();

  const participations = await prisma.participation.findMany({
    where: { userId: user.id },
    include: { project: true, projectRole: true },
    orderBy: { invitedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">Mis participaciones</p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">Proyectos en los que participas</h1>
      </div>

      {participations.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
          Todavía no te han invitado a ningún proyecto.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {participations.map((p) => (
            <Link
              key={p.id}
              href={`/participations/${p.id}`}
              className={`flex flex-col gap-3 transition hover:border-accent ${card}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={badgeAccent}>{projectCode(p.project.id)}</span>
                  <h2 className="mt-1.5 font-bold text-foreground">{p.project.name}</h2>
                  <p className="text-xs text-muted">{PROJECT_ROLE_LABELS[p.projectRole.roleType]}</p>
                </div>
                <span className={badgeNeutral}>{PARTICIPATION_STATUS_LABELS[p.status]}</span>
              </div>
              <div className="border-t border-border-light pt-3 text-xs text-muted">
                {p.status === "ACTIVE" ? `Nivel actual: ${p.currentLevel}` : "Firma el NDA para empezar"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
