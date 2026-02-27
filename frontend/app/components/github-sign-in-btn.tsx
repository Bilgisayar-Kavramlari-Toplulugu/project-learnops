import { signIn } from "@/auth";

export default function GithubSignInBtn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("github", { redirectTo: "/dashboard" });
      }}
    >
      <button type="submit" className="oauth-btn">
        Signin with GitHub
      </button>
    </form>
  );
}
