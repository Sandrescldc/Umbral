import { loginAction } from "@/lib/actions/auth-actions";
import { ErrorBanner } from "@/components/error-banner";
import { SubmitButton } from "@/components/submit-button";
import { buttonGhost, buttonPrimary, card, input, label } from "@/lib/ui";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-center font-bold text-2xl text-foreground">Entrar</h1>

      <ErrorBanner message={typeof error === "string" ? error : undefined} />

      <form action={loginAction} className={`space-y-4 ${card}`}>
        <div>
          <label className={label}>
            Email
            <input type="email" name="email" required className={input} />
          </label>
        </div>

        <div>
          <label className={label}>
            Contraseña
            <input type="password" name="password" required className={input} />
          </label>
        </div>

        <SubmitButton pendingText="Entrando…" className={`w-full ${buttonPrimary}`}>
          Entrar
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-muted">
        ¿No tienes cuenta? <a href="/register" className={buttonGhost}>Crea una</a>
      </p>
    </div>
  );
}
