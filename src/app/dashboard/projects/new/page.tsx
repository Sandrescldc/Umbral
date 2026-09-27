import Link from "next/link";
import { createProjectAction } from "@/lib/actions/project-actions";
import { ErrorBanner } from "@/components/error-banner";
import { SubmitButton } from "@/components/submit-button";
import { buttonGhost, buttonPrimary, card, input, label, textarea } from "@/lib/ui";

export default async function NewProjectPage({ searchParams }: PageProps<"/dashboard/projects/new">) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-bold text-2xl text-foreground">Nuevo proyecto</h1>
        <p className="mt-1 text-sm text-muted">
          Se crea con la plantilla del MVP: los hitos Viabilidad → Equity → Financiación, y los roles
          Inversor y Entidad financiera, cada uno con su propia escala de dos niveles de revelación.
        </p>
      </div>

      <ErrorBanner message={typeof error === "string" ? error : undefined} />

      <form action={createProjectAction} className={`space-y-4 ${card}`}>
        <div>
          <label className={label}>
            Nombre del proyecto
            <input name="name" required className={input} placeholder="Residencial Umbral Norte" />
          </label>
        </div>
        <div>
          <label className={label}>
            Referencia interna
            <input name="reference" required className={input} placeholder="UMB-2026-04" />
          </label>
        </div>
        <div>
          <label className={label}>
            Ubicación
            <input name="location" required className={input} placeholder="Zaragoza, Aragón" />
          </label>
        </div>
        <div>
          <label className={label}>
            Resumen anónimo (lo que ve cualquier invitado antes de firmar el NDA)
            <textarea name="teaserSummary" required rows={2} className={textarea} />
          </label>
        </div>
        <div>
          <label className={label}>
            Descripción completa
            <textarea name="fullDescription" required rows={4} className={textarea} />
          </label>
        </div>

        <SubmitButton pendingText="Creando…" className={`w-full ${buttonPrimary}`}>
          Crear proyecto
        </SubmitButton>
      </form>

      <Link href="/dashboard/projects" className={buttonGhost}>
        ← Volver a tus proyectos
      </Link>
    </div>
  );
}
