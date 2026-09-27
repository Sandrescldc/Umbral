import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Icon } from "@/components/icon";
import { card, buttonPrimary, buttonSecondary } from "@/lib/ui";

export default async function HomePage() {
  const user = await getCurrentUser();

  const steps = [
    {
      icon: "apartment",
      title: "El estructurador crea el proyecto",
      body: "Define los hitos (viabilidad, equity, financiación…) y qué rol se habilita en cada uno.",
    },
    {
      icon: "mail",
      title: "Invita a cada parte en su momento",
      body: "Un inversor o una entidad financiera solo aparece cuando el hito que los habilita ya está en curso.",
    },
    {
      icon: "draw",
      title: "NDA y revelación por niveles",
      body: "Cada participante firma el acuerdo de confidencialidad y sube de nivel solicitándolo, no por defecto.",
    },
    {
      icon: "fact_check",
      title: "Todo queda auditado",
      body: "Quién vio qué, cuándo pidió más información y quién aprobó cada nivel, visible para el estructurador.",
    },
  ];

  return (
    <div className="space-y-16">
      <section className="mx-auto max-w-2xl space-y-5 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
          <Icon name="shield_lock" className="text-sm" /> Estructuración de proyectos inmobiliarios
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Una sala por proyecto, no una carpeta compartida
        </h1>
        <p className="text-base text-muted">
          Umbral conecta al estructurador con inversores, entidades financieras y el resto de partes
          de un proyecto inmobiliario. Cada uno entra en su hito, ve solo lo que le corresponde y
          sube de nivel por autorización explícita — nunca por defecto.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {user ? (
            <Link href="/dashboard" className={buttonPrimary}>
              Ir a mi panel
            </Link>
          ) : (
            <>
              <Link href="/register" className={buttonPrimary}>
                Crear cuenta
              </Link>
              <Link href="/login" className={buttonSecondary}>
                Entrar
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <div key={s.title} className={card}>
            <Icon name={s.icon} className="text-xl text-accent" />
            <h2 className="mt-3 text-sm font-bold text-foreground">{s.title}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{s.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
