// Decides which routes sign-in may return to, and builds the onboarding URL.

const fallback = "/events";

export function getSignupDestination(value: string | null | undefined): string {
  if (value === "/members/profile" || /^\/events\/[a-z0-9]+(?:-[a-z0-9]+)*\/register$/.test(value ?? "")) {
    return value as string;
  }
  return fallback;
}

export function getOnboardingPath(destination: string, profileComplete: boolean): string {
  const safeDestination = getSignupDestination(destination);
  if (profileComplete) return safeDestination;
  return `/profile/setup?next=${encodeURIComponent(safeDestination)}`;
}

// Decides where to send the user after the OAuth callback: setup, destination, or retry.

type SignupCallbackOptions = {
  destination: string | null | undefined;
  code: string | null;
  exchangeCode: (code: string) => Promise<{ error: unknown | null }>;
  readAccount: () => Promise<{ profileComplete: boolean } | null>;
};

export async function resolveSignupCallback({
  destination,
  code,
  exchangeCode,
  readAccount,
}: SignupCallbackOptions): Promise<string> {
  const safeDestination = getSignupDestination(destination);
  if (code) {
    const { error } = await exchangeCode(code);
    if (!error) {
      const account = await readAccount();
      if (account) {
        return getOnboardingPath(safeDestination, account.profileComplete);
      }
    }
  }
  return `/sign-in?next=${encodeURIComponent(safeDestination)}&error=oauth`;
}
