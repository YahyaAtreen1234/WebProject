import { verifyChallenge, type CaptchaResult } from '@/lib/captcha';
import { isRecaptchaEnabled, verifyRecaptcha } from '@/lib/recaptcha';

export interface HumanCheckPayload {
  /** Google reCAPTCHA response, when site keys are configured. */
  recaptchaToken?: string | null;
  /** Built-in challenge token issued by GET /api/captcha. */
  captchaToken?: string | null;
  /** The visitor's answer to the built-in challenge. */
  captchaAnswer?: string | null;
}

export interface HumanCheckOutcome {
  ok: boolean;
  error?: string;
}

/**
 * Confirms a request came from a person.
 *
 * Google reCAPTCHA takes precedence when RECAPTCHA_SECRET_KEY is set, since it
 * is the stronger signal. Otherwise the built-in arithmetic challenge is used,
 * so the check works with no third-party account or configuration.
 */
export async function verifyHuman(payload: HumanCheckPayload): Promise<HumanCheckOutcome> {
  if (isRecaptchaEnabled()) {
    const passed = await verifyRecaptcha(payload.recaptchaToken);
    return passed ? { ok: true } : { ok: false, error: 'Captcha verification failed. Please try again.' };
  }

  const result: CaptchaResult = verifyChallenge(payload.captchaToken, payload.captchaAnswer);

  switch (result) {
    case 'valid':
      return { ok: true };
    case 'expired':
      return { ok: false, error: 'The verification challenge expired. Please try again.' };
    case 'wrong':
      return { ok: false, error: 'Incorrect answer to the verification question.' };
    default:
      return { ok: false, error: 'Please complete the "I am not a robot" check.' };
  }
}
