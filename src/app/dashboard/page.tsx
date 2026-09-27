import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();

  if (user.role === "ESTRUCTURADOR") {
    redirect("/dashboard/projects");
  }
  redirect("/dashboard/participations");
}
