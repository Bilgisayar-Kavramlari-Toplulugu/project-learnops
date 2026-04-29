import OAuthButton from "./oauth-button";

export default function OAuthButtonContainer() {
  const providers = [
    { name: "Google", comingSoon: false },
    { name: "GitHub", comingSoon: false },
    { name: "LinkedIn", comingSoon: false },
  ];

  return (
    <div className="space-y-3">
      {providers.map(({ name, comingSoon }) => (
        <OAuthButton key={name} provider={name} comingSoon={comingSoon} />
      ))}
    </div>
  );
}
