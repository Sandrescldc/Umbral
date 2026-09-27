import {
  Ban,
  Building2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Flag,
  Handshake,
  Key,
  Lock,
  LockOpen,
  Mail,
  MapPin,
  Menu,
  PenLine,
  Plus,
  ShieldCheck,
  Undo2,
  Wallet,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";

// Semantic icon names used across the app, mapped to a lineal Lucide icon.
const ICONS: Record<string, LucideIcon> = {
  shield_lock: ShieldCheck,
  verified_user: ShieldCheck,
  verified: ShieldCheck,
  visibility: Eye,
  visibility_off: EyeOff,
  lock: Lock,
  lock_open: LockOpen,
  location_on: MapPin,
  apartment: Building2,
  check: Check,
  check_circle: CheckCircle2,
  fact_check: ClipboardCheck,
  account_balance_wallet: Wallet,
  handshake: Handshake,
  draw: PenLine,
  key: Key,
  vpn_key: Key,
  add: Plus,
  description: FileText,
  mail: Mail,
  schedule: Clock,
  flag: Flag,
  menu: Menu,
  close: X,
  cancel: XCircle,
  undo: Undo2,
  block: Ban,
};

export function Icon({ name, className = "" }: { name: string; className?: string }) {
  const LucideIconComponent = ICONS[name] ?? Lock;
  return (
    <LucideIconComponent
      className={`inline-block shrink-0 ${className}`}
      style={{ width: "1em", height: "1em" }}
      strokeWidth={1.5}
      aria-hidden="true"
    />
  );
}
