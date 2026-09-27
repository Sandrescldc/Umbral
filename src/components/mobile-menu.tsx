"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { buttonSecondary } from "@/lib/ui";

export function MobileMenu({
  isLoggedIn,
  userName,
  roleLabel,
  logoutAction,
}: {
  isLoggedIn: boolean;
  userName?: string;
  roleLabel?: string;
  logoutAction: (formData: FormData) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted"
      >
        <Icon name={open ? "close" : "menu"} className="text-xl" />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 border-b border-border bg-surface px-6 py-4 shadow-sm">
          <nav className="flex flex-col gap-4 text-sm font-medium text-muted">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="hover:text-foreground">
                  Mi panel
                </Link>
                <span className="text-xs text-muted-light">
                  {userName} · {roleLabel}
                </span>
                <form action={logoutAction}>
                  <button className={buttonSecondary}>Salir</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="hover:text-foreground">
                  Entrar
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-[6px] bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition hover:brightness-125"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
