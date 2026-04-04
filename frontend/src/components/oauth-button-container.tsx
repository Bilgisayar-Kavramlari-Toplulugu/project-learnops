import OAuthButton from "./oauth-button";

export default function OAuthButtonContainer() {
  const providers = [
    { name: "Google", comingSoon: false },
    { name: "GitHub", comingSoon: true },
    { name: "LinkedIn", comingSoon: true },
  ];

  return (
    <div className="space-y-3">
      {providers.map(({ name, comingSoon }) => (
        <OAuthButton key={name} provider={name} comingSoon={comingSoon} />
      ))}
    </div>
  );
}
