export function parseBusinessEmails(value: string | null | undefined): string[] {
  const emails = new Map<string, string>();

  for (const address of (value || '').split(/[\n,;]+/)) {
    const email = address.trim();
    if (email) emails.set(email.toLowerCase(), email);
  }

  return Array.from(emails.values());
}

export function isValidBusinessEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
