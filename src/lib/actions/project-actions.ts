"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { logAccess } from "@/lib/access-log";

// Plantilla fija del MVP: tres hitos, dos roles. Ampliar el ciclo (origen,
// licencia, formalización, ejecución, salida) o añadir constructora/notaría/
// suelo es tocar esta plantilla, no rediseñar el modelo.
const DEFAULT_INVESTOR_LEVELS = [
  { level: 1, label: "Memoria y números agregados", description: "Estudio de viabilidad, superficie, presupuesto agregado y calendario estimado." },
  { level: 2, label: "Data room completo", description: "Cuenta de explotación detallada, pacto de socios y estructura societaria (SPV)." },
];

const DEFAULT_BANK_LEVELS = [
  { level: 1, label: "Memoria y garantías", description: "Estudio de viabilidad, garantías disponibles y preventas comprometidas." },
  { level: 2, label: "Data room completo", description: "Cuenta de explotación detallada, tasación y documentación de garantías." },
];

const createProjectSchema = z.object({
  name: z.string().trim().min(3, "El nombre del proyecto es demasiado corto."),
  reference: z.string().trim().min(2, "Añade una referencia interna."),
  location: z.string().trim().min(2, "Indica la ubicación."),
  teaserSummary: z.string().trim().min(10, "El resumen anónimo debe tener al menos 10 caracteres."),
  fullDescription: z.string().trim().min(10, "La descripción completa debe tener al menos 10 caracteres."),
});

export async function createProjectAction(formData: FormData) {
  const structurator = await requireRole(["ESTRUCTURADOR"]);

  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
    reference: formData.get("reference"),
    location: formData.get("location"),
    teaserSummary: formData.get("teaserSummary"),
    fullDescription: formData.get("fullDescription"),
  });

  if (!parsed.success) {
    redirect(`/dashboard/projects/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const data = parsed.data;

  const project = await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        structuratorId: structurator.id,
        name: data.name,
        reference: data.reference,
        location: data.location,
        teaserSummary: data.teaserSummary,
        fullDescription: data.fullDescription,
      },
    });

    await tx.projectMilestone.create({
      data: {
        projectId: project.id,
        key: "VIABILIDAD",
        sortOrder: 1,
        status: "ACTIVE",
        closeCriteria: "Estudio de mercado y anteproyecto validados.",
      },
    });
    const equity = await tx.projectMilestone.create({
      data: {
        projectId: project.id,
        key: "EQUITY",
        sortOrder: 2,
        status: "PENDING",
        closeCriteria: "Equity comprometido ≥ 80% del objetivo.",
      },
    });
    const financiacion = await tx.projectMilestone.create({
      data: {
        projectId: project.id,
        key: "FINANCIACION",
        sortOrder: 3,
        status: "PENDING",
        closeCriteria: "Term sheet firmado con la entidad financiera.",
      },
    });

    const investorRole = await tx.projectRole.create({
      data: { projectId: project.id, roleType: "INVERSOR", opensAtMilestoneId: equity.id },
    });
    const bankRole = await tx.projectRole.create({
      data: { projectId: project.id, roleType: "ENTIDAD_FINANCIERA", opensAtMilestoneId: financiacion.id },
    });

    await tx.disclosureLevel.createMany({
      data: DEFAULT_INVESTOR_LEVELS.map((l) => ({ ...l, projectRoleId: investorRole.id })),
    });
    await tx.disclosureLevel.createMany({
      data: DEFAULT_BANK_LEVELS.map((l) => ({ ...l, projectRoleId: bankRole.id })),
    });

    return project;
  });

  redirect(`/dashboard/projects/${project.id}`);
}

async function loadOwnedProject(projectId: string) {
  const structurator = await requireRole(["ESTRUCTURADOR"]);
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.structuratorId !== structurator.id) {
    redirect("/dashboard/projects");
  }
  return { structurator, project: project! };
}

export async function closeMilestoneAction(milestoneId: string) {
  const structurator = await requireRole(["ESTRUCTURADOR"]);

  const milestone = await prisma.projectMilestone.findUnique({
    where: { id: milestoneId },
    include: { project: true },
  });
  if (!milestone || milestone.project.structuratorId !== structurator.id || milestone.status !== "ACTIVE") {
    redirect("/dashboard/projects");
  }

  const nextMilestone = await prisma.projectMilestone.findFirst({
    where: { projectId: milestone!.projectId, sortOrder: { gt: milestone!.sortOrder } },
    orderBy: { sortOrder: "asc" },
  });

  await prisma.$transaction([
    prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: { status: "CLOSED", closedAt: new Date() },
    }),
    ...(nextMilestone
      ? [
          prisma.projectMilestone.update({
            where: { id: nextMilestone.id },
            data: { status: "ACTIVE" },
          }),
        ]
      : []),
  ]);

  await logAccess({
    projectId: milestone!.projectId,
    userId: structurator.id,
    action: "MILESTONE_CLOSED",
    detail: milestone!.key,
  });

  revalidatePath(`/dashboard/projects/${milestone!.projectId}`);
  redirect(`/dashboard/projects/${milestone!.projectId}`);
}

export { loadOwnedProject };
