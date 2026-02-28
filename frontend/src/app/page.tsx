import { redirect } from "next/navigation";
import { routes } from "@/shared/lib/config/routes";

export default function HomePage() {
  redirect(routes.dashboard);
}
