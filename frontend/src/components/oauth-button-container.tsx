import OAuthButton from "./oauth-button";

export default function OAuthButtonContainer() {
  const providers = ["Google", "GitHub", "LinkedIn"];

  return (
    <div className="space-y-3">
      {providers.map((provider) => (
        <OAuthButton key={provider} provider={provider} />
      ))}
    </div>
  );
}
