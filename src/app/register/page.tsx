import { registerAction } from "@/lib/actions/auth-actions";
import { ErrorBanner } from "@/components/error-banner";
import { SubmitButton } from "@/components/submit-button";
import { buttonGhost, buttonPrimary, card, input, label, select } from "@/lib/ui";

export default async function RegisterPage({
  searchParams,
}: PageProps<"/register">) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <h1 className="font-bold text-2xl text-foreground">Crear cuenta</h1>
        <p className="mt-1 text-sm text-muted">
          Elige el rol que mejor describe cómo vas a usar Umbral. Constructora, notaría y propietario
          del suelo se incorporan por invitación dentro de un proyecto, no desde aquí.
        </p>
      </div>

      <ErrorBanner message={typeof error === "string" ? error : undefined} />

      <form action={registerAction} className={`space-y-4 ${card}`}>
        <div>
          <label className={label}>
            Soy...
            <select name="role" defaultValue="INVERSOR" className={select}>
              <option value="ESTRUCTURADOR">Estructurador de proyectos</option>
              <option value="INVERSOR">Inversor</option>
              <option value="ENTIDAD_FINANCIERA">Entidad financiera</option>
            </select>
          </label>
        </div>

        <div>
          <label className={label}>
            Nombre
            <input name="name" required className={input} />
          </label>
        </div>

        <div>
          <label className={label}>
            Email
            <input type="email" name="email" required className={input} />
          </label>
        </div>

        <div>
          <label className={label}>
            Contraseña
            <input type="password" name="password" minLength={8} required className={input} />
          </label>
        </div>

        <SubmitButton pendingText="Creando cuenta…" className={`w-full ${buttonPrimary}`}>
          Crear cuenta
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-muted">
        ¿Ya tienes cuenta? <a href="/login" className={buttonGhost}>Entra aquí</a>
      </p>
    </div>
  );
}
