import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default function HomePage() {
  redirect(routes.dashboard);
}
