import OAuthButtonContainer from "./oauth-button-container";

export default function LoginRightCard() {
  return (
    <section className="w-full max-w-md rounded-3xl border border-cyan-900/40 bg-slate-900/70 p-8 text-slate-200 shadow-[0_0_0_1px_rgba(14,116,144,0.12),0_24px_70px_rgba(2,6,23,0.6)] backdrop-blur">
      <h2 className="text-center text-4xl font-bold text-white">LearnOps</h2>
      <p className="mt-2 text-center text-sm text-slate-400">
        Hesabiniza giris yapin
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            E-Posta veya Kullanici Adi
          </label>
          <input
            type="text"
            placeholder="ornek@email.com"
            className="mt-2 w-full rounded-xl border border-sky-700/50 bg-slate-950/70 px-4 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Sifre
          </label>
          <input
            type="password"
            placeholder="••••••••••"
            className="mt-2 w-full rounded-xl border border-sky-700/50 bg-slate-950/70 px-4 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-300">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500"
            />
            Beni Hatirla
          </label>
          <button
            type="button"
            className="font-medium text-cyan-400 transition hover:text-cyan-300"
          >
            Sifremi Unuttum?
          </button>
        </div>

        <button
          type="button"
          className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-3 text-base font-semibold text-white transition hover:from-sky-500 hover:to-cyan-400"
        >
          Giris Yap →
        </button>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
        <div className="h-px flex-1 bg-slate-700/70" />
        veya
        <div className="h-px flex-1 bg-slate-700/70" />
      </div>

      <OAuthButtonContainer />

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-400">Hesabiniz yok mu?</p>
        <button
          type="button"
          className="mt-2 text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
        >
          Ucretsiz Kayit Ol →
        </button>
      </div>
    </section>
  );
}
