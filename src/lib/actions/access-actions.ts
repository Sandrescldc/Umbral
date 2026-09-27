"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/auth";
import { logAccess } from "@/lib/access-log";
import { expireStaleRequests } from "@/lib/request-expiry";

const requestLevelSchema = z.object({
  message: z
    .string()
    .trim()
    .min(10, "Explica brevemente por qué necesitas el siguiente nivel (mín. 10 caracteres)."),
});

export async function requestLevelAction(participationId: string, formData: FormData) {
  const user = await requireUser();

  const participation = await prisma.participation.findUnique({
    where: { id: participationId },
    include: { projectRole: { include: { disclosureLevels: true } } },
  });
  if (!participation || participation.userId !== user.id || participation.status !== "ACTIVE") {
    redirect("/dashboard/participations");
  }

  const maxLevel = Math.max(0, ...participation!.projectRole.disclosureLevels.map((l) => l.level));
  if (participation!.currentLevel >= maxLevel) {
    redirect(`/participations/${participationId}`);
  }

  const parsed = requestLevelSchema.safeParse({ message: formData.get("message") });
  if (!parsed.success) {
    redirect(`/participations/${participationId}?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  await expireStaleRequests({ participationId });

  const pending = await prisma.accessRequest.findFirst({
    where: { participationId, status: "PENDING" },
  });
  if (pending) {
    redirect(
      `/participations/${participationId}?error=${encodeURIComponent("Ya tienes una solicitud pendiente de respuesta.")}`,
    );
  }

  const request = await prisma.accessRequest.create({
    data: {
      participationId,
      requestedLevel: participation!.currentLevel + 1,
      message: parsed.data.message,
    },
  });

  await logAccess({
    projectId: participation!.projectId,
    userId: user.id,
    participationId,
    action: "LEVEL_REQUESTED",
    level: request.requestedLevel,
  });

  revalidatePath(`/participations/${participationId}`);
  redirect(`/participations/${participationId}`);
}

async function loadOwnedRequest(requestId: string) {
  const structurator = await requireRole(["ESTRUCTURADOR"]);
  const request = await prisma.accessRequest.findUnique({
    where: { id: requestId },
    include: { participation: { include: { project: true } } },
  });
  if (!request || request.participation.project.structuratorId !== structurator.id) {
    redirect("/dashboard/projects");
  }
  return { structurator, request: request! };
}

export async function approveRequestAction(requestId: string) {
  const { structurator, request } = await loadOwnedRequest(requestId);

  if (request.status !== "PENDING") {
    redirect(`/dashboard/projects/${request.participation.projectId}`);
  }

  await prisma.$transaction([
    prisma.accessRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED", decidedAt: new Date(), decidedById: structurator.id },
    }),
    prisma.participation.update({
      where: { id: request.participationId },
      data: { currentLevel: request.requestedLevel },
    }),
  ]);

  await logAccess({
    projectId: request.participation.projectId,
    userId: structurator.id,
    participationId: request.participationId,
    action: "LEVEL_APPROVED",
    level: request.requestedLevel,
  });

  revalidatePath(`/dashboard/projects/${request.participation.projectId}`);
  revalidatePath(`/participations/${request.participationId}`);
  redirect(`/dashboard/projects/${request.participation.projectId}`);
}

export async function rejectRequestAction(requestId: string) {
  const { structurator, request } = await loadOwnedRequest(requestId);

  if (request.status !== "PENDING") {
    redirect(`/dashboard/projects/${request.participation.projectId}`);
  }

  await prisma.accessRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED", decidedAt: new Date(), decidedById: structurator.id },
  });

  await logAccess({
    projectId: request.participation.projectId,
    userId: structurator.id,
    participationId: request.participationId,
    action: "LEVEL_REJECTED",
  });

  revalidatePath(`/dashboard/projects/${request.participation.projectId}`);
  revalidatePath(`/participations/${request.participationId}`);
  redirect(`/dashboard/projects/${request.participation.projectId}`);
}
