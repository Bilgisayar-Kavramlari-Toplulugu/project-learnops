import GithubSignInBtn from "../components/github-sign-in-btn";
import GoogleSignInBtn from "../components/google-sign-in-btn";
import LinkedinSignInBtn from "../components/linkedin-sign-in-btn";

export default function Login() {
  return (
    <main>
      <GithubSignInBtn />
      <GoogleSignInBtn />
      <LinkedinSignInBtn />
    </main>
  );
}
