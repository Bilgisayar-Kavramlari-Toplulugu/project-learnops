interface WrapperContainerProps {
  children: React.ReactNode;
}
function WrapperContainer({ children }: WrapperContainerProps) {
  return (
    <section className="mx-auto w-full max-w-6xl min-h-[62vh] rounded-2xl border border-blue-200/80 bg-white/65 px-6 py-10 dark:border-slate-700 dark:bg-slate-900/55">
      <div className="w-full">{children}</div>
    </section>
  );
}
export default WrapperContainer;