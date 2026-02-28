import LoginLeftCard from "../components/login-left-card";
import LoginRightCard from "../components/login-right-card";

export default function Login() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-10">
      <div className="grid w-full items-stretch gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <LoginLeftCard />
        <LoginRightCard />
      </div>
    </main>
  );
}
