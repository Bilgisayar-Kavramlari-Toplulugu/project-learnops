export interface PasswordStrengthCheck {
  id: string;
  label: string;
  passed: boolean;
}

export interface PasswordStrengthResult {
  score: number;
  label: "Zayif" | "Orta" | "Iyi" | "Guclu";
  checks: PasswordStrengthCheck[];
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const checks: PasswordStrengthCheck[] = [
    {
      id: "length",
      label: "En az 8 karakter",
      passed: password.length >= 8,
    },
    {
      id: "upper",
      label: "Buyuk harf",
      passed: /[A-Z]/.test(password),
    },
    {
      id: "lower",
      label: "Kucuk harf",
      passed: /[a-z]/.test(password),
    },
    {
      id: "number",
      label: "Rakam",
      passed: /[0-9]/.test(password),
    },
    {
      id: "special",
      label: "Ozel karakter",
      passed: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const score = checks.filter((check) => check.passed).length;

  if (score <= 2) {
    return { score, label: "Zayif", checks };
  }

  if (score === 3) {
    return { score, label: "Orta", checks };
  }

  if (score === 4) {
    return { score, label: "Iyi", checks };
  }

  return { score, label: "Guclu", checks };
}
