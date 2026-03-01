import LoginLeftCard from "../components/login-left-card";
import LoginRightCard from "../components/login-right-card";

export default function Login() {
  return (
    <main className="flex min-h-screen w-full items-center bg-slate-950 px-6 py-10">
      <div className="mx-auto grid w-full max-w-7xl items-stretch gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="order-2 flex w-full justify-center lg:order-1 lg:justify-start">
          <LoginLeftCard />
        </div>
        <div className="order-1 flex w-full justify-center lg:order-2 lg:justify-end">
          <LoginRightCard />
        </div>
      </div>
    </main>
  );
}
