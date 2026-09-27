import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MILESTONE_KEY_LABELS, PROJECT_STATUS_LABELS, projectCode } from "@/lib/labels";
import { Icon } from "@/components/icon";
import { badgeAccent, buttonPrimary, card } from "@/lib/ui";

export default async function ProjectsPage() {
  const structurator = await requireRole(["ESTRUCTURADOR"]);

  const projects = await prisma.project.findMany({
    where: { structuratorId: structurator.id },
    orderBy: { createdAt: "desc" },
    include: {
      milestones: { orderBy: { sortOrder: "asc" } },
      _count: {
        select: {
          participations: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Panel del estructurador</p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">Tus proyectos</h1>
        </div>
        <Link href="/dashboard/projects/new" className={buttonPrimary}>
          <Icon name="add" className="text-sm" /> Nuevo proyecto
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
          Todavía no has creado ningún proyecto.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {projects.map((project) => {
            const activeMilestone = project.milestones.find((m) => m.status === "ACTIVE");
            return (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className={`flex flex-col gap-3 transition hover:border-accent ${card}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={badgeAccent}>{projectCode(project.id)}</span>
                    <h2 className="mt-1.5 font-bold text-foreground">{project.name}</h2>
                    <p className="text-xs text-muted">{project.location}</p>
                  </div>
                  <span className="rounded-full bg-border-light px-2.5 py-1 text-[11px] font-semibold text-muted">
                    {PROJECT_STATUS_LABELS[project.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border-light pt-3 text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <Icon name="flag" className="text-sm" />
                    {activeMilestone ? MILESTONE_KEY_LABELS[activeMilestone.key] : "Sin hito activo"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon name="handshake" className="text-sm" />
                    {project._count.participations} participante(s)
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
