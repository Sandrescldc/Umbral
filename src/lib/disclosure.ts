import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * A rol's disclosure scale isn't a fixed global constant like Off Market's
 * 4 stages — each ProjectRole defines its own DisclosureLevel rows. These
 * helpers wrap the small pieces of logic that depend on that scale.
 */

export async function getRoleLevels(projectRoleId: string) {
  return prisma.disclosureLevel.findMany({
    where: { projectRoleId },
    orderBy: { level: "asc" },
  });
}

/** The level a participant actually sees: 0 (teaser) until the NDA step is done. */
export function effectiveLevel(participation: { status: string; currentLevel: number }): number {
  return participation.status === "ACTIVE" ? participation.currentLevel : 0;
}

/** A role can only be invited once its gating milestone has started. */
export function isRoleOpen(milestone: { status: string }): boolean {
  return milestone.status !== "PENDING";
}
