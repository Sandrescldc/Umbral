import "server-only";

import { prisma } from "@/lib/prisma";
import type { AccessAction } from "@prisma/client";

export async function logAccess(params: {
  projectId: string;
  userId: string;
  action: AccessAction;
  participationId?: string;
  level?: number;
  detail?: string;
}) {
  await prisma.accessLog.create({
    data: {
      projectId: params.projectId,
      userId: params.userId,
      action: params.action,
      participationId: params.participationId,
      level: params.level,
      detail: params.detail,
    },
  });
}
