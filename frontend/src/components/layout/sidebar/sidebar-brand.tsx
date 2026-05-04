import { routes } from "@/lib/routes";
import { Logo } from "../logo";

export function SidebarBrand() {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-blue-100/80 bg-white/90 px-3 py-3 shadow-sm shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-900/85 dark:shadow-black/20">
      <Logo
        href={routes.dashboard}
        width={180}
        height={100}
        priority
        className="h-10 w-auto md:h-12"
      />
    </div>
  );
}
