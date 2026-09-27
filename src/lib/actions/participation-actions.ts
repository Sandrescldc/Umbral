"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/auth";
import { logAccess } from "@/lib/access-log";
import { isRoleOpen } from "@/lib/disclosure";
import type { ProjectRoleType } from "@prisma/client";

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("Introduce un email válido."),
  roleType: z.enum(["INVERSOR", "ENTIDAD_FINANCIERA"] as const),
});

/**
 * El MVP solo invita a usuarios que ya se han registrado en Umbral (no hay
 * todavía invitación por email a alguien sin cuenta). Es la simplificación
 * más visible del alcance: se resuelve más adelante con un token de
 * invitación que crea la cuenta al aceptar.
 */
export async function inviteParticipantAction(projectId: string, formData: FormData) {
  const structurator = await requireRole(["ESTRUCTURADOR"]);

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.structuratorId !== structurator.id) {
    redirect("/dashboard/projects");
  }

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    roleType: formData.get("roleType"),
  });
  if (!parsed.success) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }
  const { email, roleType } = parsed.data as { email: string; roleType: ProjectRoleType };

  const projectRole = await prisma.projectRole.findUnique({
    where: { projectId_roleType: { projectId, roleType } },
    include: { opensAtMilestone: true },
  });
  if (!projectRole || !isRoleOpen(projectRole.opensAtMilestone)) {
    redirect(
      `/dashboard/projects/${projectId}?error=${encodeURIComponent("Este rol todavía no está habilitado en el hito actual del proyecto.")}`,
    );
  }

  const invitee = await prisma.user.findUnique({ where: { email } });
  if (!invitee) {
    redirect(
      `/dashboard/projects/${projectId}?error=${encodeURIComponent("No hay ninguna cuenta registrada con ese email todavía.")}`,
    );
  }

  const existing = await prisma.participation.findUnique({
    where: { projectRoleId_userId: { projectRoleId: projectRole!.id, userId: invitee!.id } },
  });
  if (existing) {
    redirect(
      `/dashboard/projects/${projectId}?error=${encodeURIComponent("Esa persona ya tiene una participación en este rol.")}`,
    );
  }

  const participation = await prisma.participation.create({
    data: {
      projectId,
      projectRoleId: projectRole!.id,
      userId: invitee!.id,
      invitedById: structurator.id,
    },
  });

  await logAccess({
    projectId,
    userId: structurator.id,
    participationId: participation.id,
    action: "PARTICIPATION_INVITED",
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
  redirect(`/dashboard/projects/${projectId}`);
}

async function loadOwnParticipation(participationId: string) {
  const user = await requireUser();
  const participation = await prisma.participation.findUnique({ where: { id: participationId } });
  if (!participation || participation.userId !== user.id) {
    redirect("/dashboard/participations");
  }
  return { user, participation: participation! };
}

export async function acceptNdaAction(participationId: string) {
  const { user, participation } = await loadOwnParticipation(participationId);

  if (participation.status !== "INVITED") {
    redirect(`/participations/${participationId}`);
  }

  await prisma.participation.update({
    where: { id: participationId },
    data: { status: "ACTIVE", ndaAcceptedAt: new Date() },
  });

  await logAccess({
    projectId: participation.projectId,
    userId: user.id,
    participationId,
    action: "NDA_ACCEPTED",
  });

  revalidatePath(`/participations/${participationId}`);
  redirect(`/participations/${participationId}`);
}

export async function withdrawParticipationAction(participationId: string) {
  const { user, participation } = await loadOwnParticipation(participationId);

  if (participation.status !== "ACTIVE" && participation.status !== "INVITED") {
    redirect(`/participations/${participationId}`);
  }

  await prisma.participation.update({
    where: { id: participationId },
    data: { status: "WITHDRAWN" },
  });

  await logAccess({
    projectId: participation.projectId,
    userId: user.id,
    participationId,
    action: "PARTICIPATION_WITHDRAWN",
  });

  revalidatePath("/dashboard/participations");
  redirect("/dashboard/participations");
}
