import { cn } from "@/lib/utils";

interface WrapperContainerProps {
  children: React.ReactNode;
  wide?: boolean;
}
function WrapperContainer({ children, wide = false }: WrapperContainerProps) {
  return (
    <section
      className={cn(
        "mx-auto w-full min-h-[62vh] rounded-2xl border border-blue-200/80 bg-white/65 px-6 py-10 dark:border-slate-700 dark:bg-slate-900/55",
        wide ? "max-w-none" : "max-w-6xl",
      )}
    >
      <div className="w-full">{children}</div>
    </section>
  );
}
export default WrapperContainer;
