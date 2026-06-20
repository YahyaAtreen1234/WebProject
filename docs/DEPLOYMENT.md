# Deployment Guide

Complete guide for deploying Mineral Gallery to production.

## Prerequisites

- GitHub account with repository access
- Vercel account (free tier available)
- PostgreSQL database (Railway, Vercel Postgres, or Supabase)
- Stripe production account
- Email service (Gmail, SendGrid, etc.)
- Vercel Blob storage token

## Step 1: Prepare Production Environment

### 1.1 Create Production Database

Choose one of:

**Option A: Railway (Recommended)**
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL plugin
4. Copy DATABASE_URL

**Option B: Vercel Postgres**
1. Go to Vercel Dashboard
2. Create new project
3. Add Postgres storage
4. Copy connection string

**Option C: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy DATABASE_URL from Project Settings

### 1.2 Run Database Migrations

```bash
# Locally first (testing)
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Or let Vercel run migrations automatically
```

## Step 2: Connect GitHub Repository

### 2.1 Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select "Next.js" framework
5. Click "Deploy"

### 2.2 Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

```
DATABASE_URL=postgresql://...
JWT_SECRET=<strong-random-secret>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=<app-password>
SMTP_FROM=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
```

**Important:** Set these for Production environment

## Step 3: Configure GitHub Actions

### 3.1 Add Vercel Secrets

In GitHub Repository → Settings → Secrets and variables → Actions, add:

```
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-org-id>
VERCEL_PROJECT_ID=<your-project-id>
```

Get these from:
- Vercel Token: Vercel Dashboard → Account Settings → Tokens
- Org ID: Vercel Dashboard URL or `vercel whoami`
- Project ID: `.vercel/project.json`

### 3.2 Workflows

Workflows automatically run on push:
- `test.yml` - Runs on all pushes (lint, type check, build)
- `deploy.yml` - Deploys to production on main branch

## Step 4: Configure Services

### 4.1 Stripe

1. Go to [stripe.com](https://stripe.com) and create account
2. Enable production mode
3. Get API keys from Dashboard
4. Add webhook endpoint in Vercel:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 4.2 Email Service

**Gmail Setup:**
1. Enable 2-factor authentication
2. Generate App Password
3. Use in SMTP_PASS

**Alternative: SendGrid**
1. Create SendGrid account
2. Generate API key
3. Use API key as SMTP_PASS with username "apikey"

### 4.3 Vercel Blob Storage

1. In Vercel Project → Storage
2. Create new Blob store
3. Copy `BLOB_READ_WRITE_TOKEN`
4. Add to environment variables

## Step 5: Domain Configuration

### 5.1 Custom Domain

1. In Vercel Dashboard → Project → Domains
2. Add your domain
3. Follow DNS configuration steps
4. Update `NEXT_PUBLIC_APP_URL` to https://yourdomain.com

### 5.2 DNS Records

Add DNS records as provided by Vercel:
- CNAME record for www subdomain
- A record for root domain (optional)

## Step 6: Testing Production

### 6.1 Preview Deployment

1. All PRs get preview deployments automatically
2. Test changes before merging to main
3. Use production environment variables for testing

### 6.2 Production Deployment

1. Merge PR to main branch
2. GitHub Actions automatically:
   - Runs tests and linting
   - Builds the project
   - Deploys to Vercel production
3. Monitor deployment in Vercel Dashboard

## Step 7: Monitoring & Maintenance

### 7.1 Set Up Monitoring

Consider adding:
- **Error tracking:** Sentry (free tier)
- **Uptime monitoring:** Pingdom, StatusCake
- **Analytics:** Vercel Analytics (built-in)

### 7.2 Database Backups

- Railway: Automatic daily backups
- Vercel Postgres: Automatic backups
- Supabase: Configure in project settings

### 7.3 Regular Tasks

- Review error logs weekly
- Check database performance monthly
- Update dependencies quarterly
- Review security advisories

## Troubleshooting

### Build Fails

Check build logs in Vercel:
1. Vercel Dashboard → Project → Deployments
2. Click failed deployment
3. Check "Build Logs"

Common issues:
- Missing environment variables
- TypeScript errors
- Missing dependencies

### Database Connection Fails

1. Verify DATABASE_URL is correct
2. Check database is running
3. Run migrations: `npx prisma migrate deploy`
4. Check firewall/security rules

### Email Not Sending

1. Verify SMTP credentials
2. Check sender email is verified
3. Look for SMTP errors in logs
4. Test with direct SMTP connection

### Stripe Errors

1. Verify API keys are correct
2. Check webhook is configured
3. Review Stripe Dashboard logs
4. Ensure URLs are https://

## Rollback

If deployment has issues:

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "Rollback to this Deployment"
4. Confirm rollback

## Security Checklist

Before going live:

- [ ] All environment variables set
- [ ] Database URL uses strong password
- [ ] JWT_SECRET is strong and random
- [ ] Stripe keys are production (sk_live_)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CORS properly configured
- [ ] Sensitive endpoints require authentication
- [ ] Rate limiting considered
- [ ] Error messages don't leak sensitive info
- [ ] Admin panel protected
- [ ] Database backups enabled

## Performance Optimization

### Caching

Vercel provides:
- Automatic static file caching
- ISR (Incremental Static Regeneration)
- Edge caching

### Database Optimization

- Use indexes (already in schema)
- Monitor slow queries
- Consider connection pooling (Railway/Supabase)

### Image Optimization

- Use next/image component
- Vercel Blob for storage
- Automatic optimization

## Support

For deployment issues:
- Check Vercel documentation: https://vercel.com/docs
- Review GitHub Actions logs
- Check error tracking service (Sentry)
- Contact hosting provider support

## Additional Resources

- Vercel Docs: https://vercel.com/docs/frameworks/nextjs
- Railway Docs: https://docs.railway.app
- PostgreSQL Docs: https://www.postgresql.org/docs
- Next.js Deployment: https://nextjs.org/learn/basics/deploying-nextjs-app
