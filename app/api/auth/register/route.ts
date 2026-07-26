import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
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

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: false,
        verificationCode: verificationCodeHash,
        verificationCodeExpiry,
      },
    });

    // Send the verification email without blocking the response. An
    // unreachable SMTP host takes ~55s to time out, which otherwise leaves the
    // sign-up form spinning long after the account has been created. Delivery
    // failures were already non-fatal here — the code is stored on the user.
    void sendVerificationEmail(email, verificationCode).catch((emailError) => {
      console.error('Verification email failed for', email, emailError);
    });

    return NextResponse.json(
      { message: 'Registration successful. Check your email for verification code.' },
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
