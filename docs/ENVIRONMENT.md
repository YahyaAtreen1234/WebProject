# Environment Variables Reference

Complete guide to all environment variables used in the Mineral Gallery project.

## Quick Start

1. Copy `.env.example` to `.env.local`
2. Fill in the required values
3. Restart your development server

## Variables by Category

### DATABASE

#### `DATABASE_URL` (Required)

Connection string for the database.

**Development (SQLite):**
```
DATABASE_URL="file:./prisma/dev.db"
```

**Production (PostgreSQL):**
```
DATABASE_URL="postgresql://user:password@host:port/database"
```

**Examples:**
- **Railway:** `postgresql://user:pass@hostname.railway.internal:5432/railway`
- **Vercel Postgres:** `postgresql://user:pass@ep-xxxxx.us-east-1.postgres.vercel-storage.com/verceldb`
- **Supabase:** `postgresql://user:pass@xxxxx.supabase.co:5432/postgres`

### AUTHENTICATION & SECURITY

#### `JWT_SECRET` (Required)

Secret key for signing and verifying JWT tokens.

- **Min Length:** 32 characters
- **Format:** Random alphanumeric string
- **Generate:** `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**Example:**
```
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
```

**Important:**
- Use a strong, random value in production
- Never commit this to git
- Change it if you suspect a breach

#### `ADMIN_EMAIL` (Development Only)

Email address for the initial admin user (development setup).

```
ADMIN_EMAIL="admin@minerals.local"
```

#### `ADMIN_PASSWORD` (Development Only)

Password for the initial admin user (development setup).

```
ADMIN_PASSWORD="admin123"
```

**Note:** Only used during initial database setup. Change in UI after first login.

### PAYMENT PROCESSING (Stripe)

All Stripe keys must match the same environment (test or live).

#### `STRIPE_SECRET_KEY` (Required)

Secret API key for server-side Stripe operations.

- **Format:** Starts with `sk_test_` or `sk_live_`
- **Source:** https://dashboard.stripe.com/apikeys
- **Visibility:** Server-side only (never expose to client)

**Example:**
```
STRIPE_SECRET_KEY="sk_test_4eC39HqLyjWDarhtT657BK"
```

#### `STRIPE_WEBHOOK_SECRET` (Required)

Secret for validating Stripe webhook events.

- **Format:** Starts with `whsec_test_` or `whsec_live_`
- **Source:** https://dashboard.stripe.com/webhooks
- **Usage:** Validates payment events from Stripe servers

**Example:**
```
STRIPE_WEBHOOK_SECRET="whsec_test_12345678901234567890"
```

#### `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Required)

Public API key for client-side Stripe operations.

- **Format:** Starts with `pk_test_` or `pk_live_`
- **Source:** https://dashboard.stripe.com/apikeys
- **Visibility:** Safe to expose to client
- **Prefix:** `NEXT_PUBLIC_` makes it accessible in browser

**Example:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51234567890abcdef"
```

**Important:**
- Test keys (pk_test_) for development
- Live keys (pk_live_) only in production
- Both secret and public keys must match environments

### EMAIL SERVICE (SMTP)

Configuration for sending emails (order confirmations, password resets, etc).

#### `SMTP_HOST`

SMTP server hostname.

**Examples:**
- **Gmail:** `smtp.gmail.com`
- **SendGrid:** `smtp.sendgrid.net`
- **Mailgun:** `smtp.mailgun.org`
- **AWS SES:** `email-smtp.region.amazonaws.com`

#### `SMTP_PORT`

SMTP server port.

- **TLS (Recommended):** `587`
- **SSL:** `465`
- **Unencrypted:** `25` (not recommended)

```
SMTP_PORT="587"
```

#### `SMTP_USER`

SMTP authentication username.

**For Gmail:**
```
SMTP_USER="your-email@gmail.com"
```

**For SendGrid:**
```
SMTP_USER="apikey"
```

#### `SMTP_PASS`

SMTP authentication password.

**For Gmail:**
- Generate App Password: https://support.google.com/accounts/answer/185833
- Use 16-character app password (not your Gmail password)

**For SendGrid:**
- Use your SendGrid API key

#### `SMTP_FROM`

Default sender email address for outgoing emails.

```
SMTP_FROM="noreply@stonesland.com"
```

**Note:** Should be verified with your email provider

### FILE UPLOADS (Vercel Blob)

Configuration for image uploads (products, reviews, etc).

#### `BLOB_READ_WRITE_TOKEN`

Token for accessing Vercel Blob storage.

- **Source:** https://vercel.com/dashboard/store/blob
- **Format:** Long alphanumeric string
- **Required for:** Production image uploads
- **Optional for:** Development (images stored locally)

**Example:**
```
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_abc123def456"
```

### APPLICATION

#### `NEXT_PUBLIC_APP_URL`

Public URL of your application (used in emails, redirects, OAuth callbacks).

**Development:**
```
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Production:**
```
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

**Important:**
- Must match your actual deployment URL
- Used in email links
- Used in OAuth redirects
- Prefix `NEXT_PUBLIC_` makes it accessible in browser

#### `NODE_ENV`

Node.js environment.

- **Options:** `development`, `production`
- **Default:** Next.js auto-detects based on build

```
NODE_ENV="development"  # or "production"
```

### SUPABASE (Optional)

Additional configuration if using Supabase services.

#### `NEXT_PUBLIC_SUPABASE_URL`

Supabase project URL.

```
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
```

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Supabase anonymous key (public, safe for client).

```
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIs..."
```

### OPTIONAL: DEBUGGING

#### `DEBUG`

Enable detailed debugging output.

```
DEBUG="*"  # All modules
DEBUG="prisma:*"  # Just Prisma
```

## Environment-Specific Values

### Development (`.env.local`)

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
ADMIN_EMAIL="admin@minerals.local"
ADMIN_PASSWORD="admin123"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"
STRIPE_SECRET_KEY="sk_test_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_test_xxxxx"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@stonesland.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Production (`.env.production`)

```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="strong-random-secret-32-chars-minimum"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_xxxxx"
STRIPE_SECRET_KEY="sk_live_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_live_xxxxx"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="production@email.com"
SMTP_PASS="production-app-password"
SMTP_FROM="noreply@yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxx"
```

## Setting Variables

### Local Development

Create `.env.local` in project root:

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### Vercel Deployment

1. Go to **Project Settings** → **Environment Variables**
2. Add each variable individually
3. Select which environments: Production, Preview, Development
4. Redeploy after adding variables

### Railway/Other Platforms

Typically through dashboard interface or CLI:

```bash
# Example: Railway
railway variables set VAR_NAME=value
```

## Security Best Practices

✅ **DO:**
- Generate strong, random JWT_SECRET
- Use test keys (pk_test_, sk_test_) in development
- Keep `.env.local` and `.env.production` in `.gitignore`
- Rotate keys annually
- Use environment-specific values
- Store secrets in platform-provided secret management

❌ **DON'T:**
- Commit `.env` files to git
- Use same secret in multiple projects
- Share `.env` files via email or chat
- Use weak/simple JWT secrets
- Prefix production secrets with dev values
- Log sensitive variables
- Use production keys in development

## Troubleshooting

### "Cannot find module or its type declarations"

Missing environment variables might cause import issues. Verify all required variables are set.

### Stripe errors: "Invalid API Key"

Check that:
- STRIPE_SECRET_KEY matches environment (test or live)
- Key is not truncated or modified
- Key format starts with `sk_test_` or `sk_live_`

### Email not sending

Verify:
- SMTP credentials are correct
- SMTP_FROM email is verified with provider
- SMTP_PORT matches your provider
- Two-factor authentication is disabled if using Gmail

### Database connection errors

Check:
- DATABASE_URL is correctly formatted
- Database server is running
- Credentials are correct
- Network access is allowed

## See Also

- [SETUP.md](./SETUP.md) - Getting started guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
