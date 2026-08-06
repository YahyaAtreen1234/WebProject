import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendVerificationEmail, isEmailConfigured } from '@/lib/email';
import { verifyRecaptcha } from '@/lib/recaptcha';
import bcryptjs from 'bcryptjs';

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, captchaToken } = await request.json();

    // Bot check (no-op unless RECAPTCHA_SECRET_KEY is configured)
    if (!(await verifyRecaptcha(captchaToken))) {
      return NextResponse.json(
        { error: 'Captcha verification failed. Please try again.' },
        { status: 400 }
      );
    }

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Same policy the sign-up forms advertise, enforced server-side so it
    // cannot be skipped by calling the API directly.
    const passwordError =
      password.length < 8
        ? 'Password must be at least 8 characters'
        : !/[A-Z]/.test(password)
        ? 'Password must contain an uppercase letter'
        : !/[a-z]/.test(password)
        ? 'Password must contain a lowercase letter'
        : !/[0-9]/.test(password)
        ? 'Password must contain a number'
        : !/[!@#$%^&*]/.test(password)
        ? 'Password must contain a special character (!@#$%^&*)'
        : '';

    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeHash = await bcryptjs.hash(verificationCode, 10);
    const verificationCodeExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Only gate the account behind a code we can actually deliver. With SMTP
    // unset — or left on the placeholder credentials from .env.example — the
    // email silently fails to send and the sign-up form parks the customer on a
    // "enter your verification code" screen forever, with a usable account they
    // cannot reach. In that case verify on creation instead.
    const canEmail = isEmailConfigured();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: !canEmail,
        verificationCode: canEmail ? verificationCodeHash : null,
        verificationCodeExpiry: canEmail ? verificationCodeExpiry : null,
      },
    });

    if (canEmail) {
      // Sent without blocking the response. An unreachable SMTP host takes ~55s
      // to time out, which otherwise leaves the sign-up form spinning long
      // after the account has been created. Delivery failures are non-fatal —
      // the code is stored on the user.
      void sendVerificationEmail(email, verificationCode).catch((emailError) => {
        console.error('Verification email failed for', email, emailError);
      });

      return NextResponse.json(
        {
          message: 'Registration successful. Check your email for verification code.',
          verificationRequired: true,
        },
        { status: 201 }
      );
    }

    console.warn(
      '[register] SMTP is not configured; created',
      email,
      'as pre-verified. Set SMTP_USER/SMTP_PASS to require email verification.'
    );

    return NextResponse.json(
      { message: 'Registration successful.', verificationRequired: false },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
