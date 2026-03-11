import { routes } from "@/lib/routes";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has("access_token");

  redirect(hasSession ? routes.dashboard : routes.login);
}
