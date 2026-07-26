/**
 * Google reCAPTCHA v2 ("I'm not a robot") server-side verification.
 *
 * Both keys are optional. When RECAPTCHA_SECRET_KEY is not set the widget is
 * never rendered client-side and verification is skipped, so existing logins
 * and registrations keep working exactly as before.
 */

export function isRecaptchaEnabled() {
  return Boolean(process.env.RECAPTCHA_SECRET_KEY);
}

export async function verifyRecaptcha(token?: string | null): Promise<boolean> {
  if (!isRecaptchaEnabled()) return true;
  if (!token) return false;

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY as string,
        response: token,
      }),
    });

    const data = (await response.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    console.error('[recaptcha] Verification request failed:', error);
    return false;
  }
}
