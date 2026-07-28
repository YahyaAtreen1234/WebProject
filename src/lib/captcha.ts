import crypto from 'crypto';

/**
 * Built-in "are you human?" challenge.
 *
 * Stateless by design: Vercel runs each request on a possibly different
 * instance, so a challenge cannot be parked in memory between the request that
 * issues it and the request that answers it.
 *
 * The answer is never sent to the browser. A challenge is identified by a
 * random nonce, and the numbers are *derived* from that nonce with an HMAC
 * keyed by the server secret. The server can therefore recompute the expected
 * answer from the nonce alone, while a client — having no secret — cannot.
 *
 * The token is `nonce.expiry.signature`; the signature stops anyone editing
 * the expiry or supplying a nonce of their choosing.
 */

const TTL_MS = 5 * 60 * 1000;

function secret() {
  return process.env.JWT_SECRET || 'captcha-development-secret';
}

function sign(value: string) {
  return crypto.createHmac('sha256', secret()).update(value).digest('hex');
}

/** Recomputes the operands for a nonce. Server-side only. */
function operandsFor(nonce: string): { a: number; b: number } {
  const digest = crypto.createHmac('sha256', secret()).update(`captcha:${nonce}`).digest();
  // 1-9 keeps the sum single-step and avoids a leading "0 + n".
  return { a: (digest[0] % 9) + 1, b: (digest[1] % 9) + 1 };
}

export interface Challenge {
  token: string;
  question: string;
}

export function createChallenge(): Challenge {
  const nonce = crypto.randomBytes(12).toString('hex');
  const expiry = Date.now() + TTL_MS;
  const token = `${nonce}.${expiry}.${sign(`${nonce}.${expiry}`)}`;
  const { a, b } = operandsFor(nonce);

  return { token, question: `What is ${a} + ${b}?` };
}

export type CaptchaResult = 'valid' | 'expired' | 'wrong' | 'invalid';

export function verifyChallenge(token?: string | null, answer?: string | null): CaptchaResult {
  if (!token || answer === undefined || answer === null || `${answer}`.trim() === '') {
    return 'invalid';
  }

  const parts = token.split('.');
  if (parts.length !== 3) return 'invalid';

  const [nonce, expiryRaw, signature] = parts;
  const expected = sign(`${nonce}.${expiryRaw}`);

  // Constant-time compare; timingSafeEqual throws on length mismatch.
  const given = Buffer.from(signature);
  const want = Buffer.from(expected);
  if (given.length !== want.length || !crypto.timingSafeEqual(given, want)) {
    return 'invalid';
  }

  const expiry = Number(expiryRaw);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return 'expired';

  const { a, b } = operandsFor(nonce);
  const submitted = Number(`${answer}`.trim());
  if (!Number.isFinite(submitted)) return 'wrong';

  return submitted === a + b ? 'valid' : 'wrong';
}
