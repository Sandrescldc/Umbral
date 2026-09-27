import type { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/password";

const DEMO_PASSWORD = "umbral1234";

export async function seedDemoData(prisma: PrismaClient) {
  const structurator = await prisma.user.upsert({
    where: { email: "estructurador@umbral.demo" },
    update: {},
    create: {
      name: "Elena Ruiz",
      email: "estructurador@umbral.demo",
      passwordHash: hashPassword(DEMO_PASSWORD),
      role: "ESTRUCTURADOR",
      verificationLevel: "VERIFIED",
    },
  });

  const investor = await prisma.user.upsert({
    where: { email: "inversor@umbral.demo" },
    update: {},
    create: {
      name: "Marcos Vidal (Family Office Vidal)",
      email: "inversor@umbral.demo",
      passwordHash: hashPassword(DEMO_PASSWORD),
      role: "INVERSOR",
      verificationLevel: "VERIFIED_FINANCIAL",
      financialsConfirmed: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "banco@umbral.demo" },
    update: {},
    create: {
      name: "Laura Gómez (Banca Pueyo)",
      email: "banco@umbral.demo",
      passwordHash: hashPassword(DEMO_PASSWORD),
      role: "ENTIDAD_FINANCIERA",
      verificationLevel: "VERIFIED",
    },
  });

  const existingProject = await prisma.project.findFirst({
    where: { structuratorId: structurator.id, reference: "UMB-DEMO-01" },
  });
  if (existingProject) {
    return { note: "El proyecto demo ya existía; no se ha duplicado.", structurator: structurator.email };
  }

  const project = await prisma.project.create({
    data: {
      structuratorId: structurator.id,
      name: "Residencial Umbral Demo",
      reference: "UMB-DEMO-01",
      location: "Zaragoza, Aragón",
      teaserSummary: "Promoción de 48 viviendas en desarrollo, suelo finalista, en fase de captación de equity.",
      fullDescription:
        "Promoción residencial de 48 viviendas plurifamiliares con garaje y trastero, suelo finalista " +
        "urbanizado. Estudio de viabilidad cerrado con margen objetivo del 22% sobre coste.",
    },
  });

  const viabilidad = await prisma.projectMilestone.create({
    data: {
      projectId: project.id,
      key: "VIABILIDAD",
      sortOrder: 1,
      status: "CLOSED",
      closeCriteria: "Estudio de mercado y anteproyecto validados.",
      closedAt: new Date(),
    },
  });
  const equity = await prisma.projectMilestone.create({
    data: {
      projectId: project.id,
      key: "EQUITY",
      sortOrder: 2,
      status: "ACTIVE",
      closeCriteria: "Equity comprometido ≥ 80% del objetivo.",
    },
  });
  const financiacion = await prisma.projectMilestone.create({
    data: {
      projectId: project.id,
      key: "FINANCIACION",
      sortOrder: 3,
      status: "PENDING",
      closeCriteria: "Term sheet firmado con la entidad financiera.",
    },
  });
  void viabilidad;

  const investorRole = await prisma.projectRole.create({
    data: { projectId: project.id, roleType: "INVERSOR", opensAtMilestoneId: equity.id },
  });
  await prisma.projectRole.create({
    data: { projectId: project.id, roleType: "ENTIDAD_FINANCIERA", opensAtMilestoneId: financiacion.id },
  });

  await prisma.disclosureLevel.createMany({
    data: [
      {
        projectRoleId: investorRole.id,
        level: 1,
        label: "Memoria y números agregados",
        description: "Estudio de viabilidad, superficie, presupuesto agregado y calendario estimado.",
      },
      {
        projectRoleId: investorRole.id,
        level: 2,
        label: "Data room completo",
        description: "Cuenta de explotación detallada, pacto de socios y estructura societaria (SPV).",
      },
    ],
  });

  await prisma.participation.create({
    data: {
      projectId: project.id,
      projectRoleId: investorRole.id,
      userId: investor.id,
      invitedById: structurator.id,
      status: "ACTIVE",
      ndaAcceptedAt: new Date(),
      currentLevel: 1,
    },
  });

  return {
    structurator: { email: structurator.email, password: DEMO_PASSWORD },
    investor: { email: investor.email, password: DEMO_PASSWORD },
    project: project.reference,
  };
}
