import { signIn } from "@/auth";

export default function LinkedinSignInBtn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("linkedin", { redirectTo: "/dashboard" });
      }}
    >
      <button type="submit" className="oauth-btn">
        Signin with Linkedin
      </button>
    </form>
  );
}
