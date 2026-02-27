import { signIn } from "@/auth";

export default function GoogleSignInBtn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/dashboard" });
      }}
    >
      <button type="submit" className="oauth-btn">
        Signin with Google
      </button>
    </form>
  );
}
