import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth-actions";
import { GLOBAL_ROLE_LABELS } from "@/lib/labels";
import { Icon } from "@/components/icon";
import { MobileMenu } from "@/components/mobile-menu";
import { buttonSecondary } from "@/lib/ui";

export async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-primary text-primary-foreground">
            <Icon name="key" className="text-base" />
          </span>
          <span className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-foreground">
            UMBRAL
            <span className="rounded bg-surface-sunken px-1.5 py-0.5 text-[9px] font-semibold text-muted">
              PRIVATE
            </span>
          </span>
        </Link>

        <MobileMenu
          isLoggedIn={Boolean(user)}
          userName={user?.name}
          roleLabel={user ? GLOBAL_ROLE_LABELS[user.role] : undefined}
          logoutAction={logoutAction}
        />

        <nav className="hidden items-center gap-5 text-[13px] font-medium text-muted sm:flex">
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-foreground">
                Mi panel
              </Link>
              <span className="hidden items-center gap-2 border-l border-border pl-4 text-xs text-muted-light sm:flex">
                {user.name} · {GLOBAL_ROLE_LABELS[user.role]}
              </span>
              <form action={logoutAction}>
                <button className={buttonSecondary}>Salir</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-foreground">
                Entrar
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center rounded-[6px] bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition hover:brightness-125"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
