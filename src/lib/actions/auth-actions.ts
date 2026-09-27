"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "@/lib/auth";
import type { GlobalRole } from "@prisma/client";

// El MVP solo abre alta directa para estos tres roles. Constructora, notaría
// y propietario del suelo se incorporan siempre por invitación del
// estructurador dentro de un proyecto, no por registro libre.
const REGISTERABLE_ROLES = ["ESTRUCTURADOR", "INVERSOR", "ENTIDAD_FINANCIERA"] as const;

const registerSchema = z.object({
  name: z.string().trim().min(2, "El nombre es demasiado corto."),
  email: z.string().trim().toLowerCase().email("Introduce un email válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  role: z.enum(REGISTERABLE_ROLES),
});

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    redirect(`/register?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect(`/register?error=${encodeURIComponent("Ya existe una cuenta con ese email.")}`);
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashPassword(password),
      role: role as GlobalRole,
    },
  });

  await createSession(user.id);
  redirect("/dashboard");
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Introduce un email válido."),
  password: z.string().min(1, "Introduce tu contraseña."),
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(`/login?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    redirect(`/login?error=${encodeURIComponent("Email o contraseña incorrectos.")}`);
  }

  await createSession(user!.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
