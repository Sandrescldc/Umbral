// Shared style primitives. Reutiliza por ahora el sistema visual de Off
// Market (mismo grupo, mismos tokens en globals.css); un rebranding propio
// de Umbral es trabajo de diseño aparte, no bloqueante para el prototipo.
// Plain className strings (not components) so they drop straight onto
// native <button>/<a>/<input> elements used inside Server Actions.

export const card = "rounded-xl border border-border bg-surface p-6 shadow-sm";

export const heading = "font-semibold tracking-tight text-foreground";

export const label = "block text-[11px] font-semibold uppercase tracking-wider text-muted";

export const input =
  "mt-1 w-full rounded-[6px] border border-border bg-surface-sunken px-3 py-2 text-sm text-foreground placeholder:text-muted-light focus:border-accent focus:bg-surface focus:outline-none focus:ring-1 focus:ring-accent transition-colors";

export const select = input;
export const textarea = input;

export const buttonPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-125 disabled:opacity-40";

export const buttonAccent =
  "inline-flex items-center justify-center gap-1.5 rounded-[6px] bg-accent px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-accent-hover disabled:opacity-40";

export const buttonVerified =
  "inline-flex items-center justify-center gap-1.5 rounded-[6px] bg-verified px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-40";

export const buttonSecondary =
  "inline-flex items-center justify-center gap-1.5 rounded-[6px] border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-sunken";

export const buttonDanger =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-transparent px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger-soft hover:border-danger/20";

export const buttonGhost =
  "text-xs font-semibold text-muted underline decoration-border underline-offset-4 hover:text-foreground";

export const badgeConfidential =
  "inline-flex items-center gap-1 rounded-full bg-surface-sunken px-2.5 py-1 text-[11px] font-semibold text-muted";

export const badgeAccent =
  "inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent";

export const badgeVerified =
  "inline-flex items-center gap-1 rounded-full bg-verified-soft px-2.5 py-1 text-[11px] font-semibold text-verified";

export const badgeNeutral =
  "inline-flex items-center gap-1 rounded-full bg-border-light px-2.5 py-1 text-[11px] font-semibold text-muted";

export const badgeDanger =
  "inline-flex items-center gap-1 rounded-full bg-danger-soft px-2.5 py-1 text-[11px] font-semibold text-danger";

export const statBox = "rounded-lg border border-border-light bg-surface-sunken p-2.5 text-center";

export const lockedMedia = "locked-media";

export function verificationBadgeClass(level: "UNVERIFIED" | "VERIFIED" | "VERIFIED_FINANCIAL") {
  return level === "UNVERIFIED" ? badgeNeutral : badgeVerified;
}
