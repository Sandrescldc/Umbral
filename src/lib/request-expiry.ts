import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const REQUEST_EXPIRY_DAYS = 14;

/**
 * Flips stale PENDING requests to REJECTED, instead of leaving a solicitud
 * de nivel abierta indefinidamente. Called lazily wherever requests are
 * read, instead of running a background job.
 */
export async function expireStaleRequests(where: Prisma.AccessRequestWhereInput) {
  const cutoff = new Date(Date.now() - REQUEST_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  await prisma.accessRequest.updateMany({
    where: { ...where, status: "PENDING", createdAt: { lt: cutoff } },
    data: { status: "REJECTED", decidedAt: new Date() },
  });
}
