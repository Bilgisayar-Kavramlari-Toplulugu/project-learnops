import OAuthButtonContainer from "./oauth-button-container";

export default function LoginRightCard() {
  return (
    <section className="w-full max-w-md rounded-3xl border border-cyan-900/40 bg-slate-900/70 p-8 text-slate-200 shadow-[0_0_0_1px_rgba(14,116,144,0.12),0_24px_70px_rgba(2,6,23,0.6)] backdrop-blur">
      <h2 className="text-center text-4xl font-bold text-white">LearnOps</h2>
      <p className="mt-2 text-center text-sm text-slate-400">
        OAuth ile giriş yapın
      </p>

      <div className="mt-8">
        <OAuthButtonContainer />
      </div>
    </section>
  );
}
