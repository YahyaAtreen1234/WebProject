# About Us Page - Complete Implementation Guide

## Overview
A fully responsive, SEO-optimized About Us page with 6 major sections, smooth animations, and mobile-first design.

## File Structure

```
src/
├── app/
│   └── about/
│       └── page.tsx              # Main About page with SEO metadata
├── components/
│   └── about/
│       ├── HeroSection.tsx       # Hero with tagline and CTA
│       ├── TimelineSection.tsx   # Company history timeline
│       ├── MissionValuesSection.tsx # Mission statement + 4 values
│       ├── TeamSection.tsx       # 8 team member cards
│       ├── TrustBadgesSection.tsx # Trust indicators + certifications
│       └── CTASection.tsx        # Final call-to-action
└── data/
    └── aboutData.ts             # All content data structures
```

## Components Overview

### 1. HeroSection
**Purpose:** Engaging landing area with company name, tagline, and primary CTA

**Features:**
- Animated gradient background with blur effects
- Fade-in animations on load
- Responsive text sizing (H1: 32px mobile → 56px desktop)
- Two CTA buttons (Explore, Learn More)
- Scroll indicator animation
- Full viewport height (60-70vh)

**Data:** Uses `companyInfo` from aboutData.ts

**Responsive Breakpoints:**
- Mobile (<640px): Single column, reduced font
- Tablet (640px-1024px): Medium font sizing
- Desktop (1024px+): Full-size hero

---

### 2. TimelineSection
**Purpose:** Visual journey showing company milestones

**Features:**
- **Desktop:** Alternating left-right zigzag layout with vertical center line
- **Mobile:** Single-column centered with animated dots and connectors
- **Animations:** Fade-in on scroll with staggered timing
- **Icons:** Emoji icons for each milestone
- **5 Milestones:** 2015-2024 company growth

**Data:** Uses `timeline` array from aboutData.ts

**Styling:**
- Gradient line connecting milestones (Desktop only)
- Hover effects on cards
- Color-coded gradient dots per milestone

---

### 3. MissionValuesSection
**Purpose:** Company mission and core values

**Features:**
- **Mission Statement:** 2-3 sentences centered at top
- **4 Value Cards:** Grid layout with:
  - Gradient icon backgrounds
  - Hover scale effects (+hover:scale-110)
  - Color-coded gradients per value
  - Brief descriptions
- **Stats Bar:** 4 key metrics (Years, Customers, Countries, Satisfaction)
- **Responsive Grid:** 4 cols → 2 cols → 1 col

**Data:** Uses `companyInfo` and `values` from aboutData.ts

**Color Coding:**
- Authenticity: Sapphire
- Sustainability: Emerald
- Excellence: Amethyst
- Education: Golden

---

### 4. TeamSection
**Purpose:** Meet the team - 8 member cards with bios and social links

**Features:**
- **Grid Layout:** 4 cols (desktop) → 2 cols (tablet) → 1 col (mobile)
- **Card Components:**
  - Circular avatar placeholder (👤)
  - Name, role, bio (line-clamped to 3)
  - Social media icons (LinkedIn, Twitter, GitHub)
  - Hover effects (border glow, shadow)
- **Social Links:** Working href to profiles
- **CTA:** "Join Our Team" link to careers page
- **Animations:** Staggered fade-in on scroll

**Data:** Uses `teamMembers` from aboutData.ts

**Accessibility:**
- ARIA labels on social links
- Semantic HTML structure
- Keyboard-navigable buttons

---

### 5. TrustBadgesSection
**Purpose:** Build trust with statistics, certifications, and partnerships

**Features:**
- **4 Trust Badges:**
  - 50,000+ Satisfied Customers
  - 98.5% Customer Satisfaction
  - 100% Authentic Guaranteed
  - 45+ Countries Served
- **Certifications Grid:** 4 certification logos/badges
- **Trust Statement:** Full-width banner with key promises
- **Hover Effects:** Scale up, shadow glow
- **Icons:** Emojis + gradient cards

**Data:** Uses `trustBadges` and `certifications` from aboutData.ts

**Content:**
- Customer count / satisfaction rates
- Industry awards and certifications
- Partnership logos
- Key metrics

---

### 6. CTASection
**Purpose:** Final conversion push to drive action

**Features:**
- **Headline:** "Ready to Start Your Collection?"
- **Supporting Text:** Benefit-focused copy
- **Two CTAs:**
  - Primary: "Browse Collection" (solid button)
  - Secondary: "Schedule Consultation" (outlined button)
- **Trust Indicators:** 
  - 30-day money-back guarantee
  - Free shipping on $500+
  - Lifetime authenticity guarantee
- **Background Animation:** Gradient blur effects
- **Stack Vertically:** Mobile button stack

---

## Responsive Design Specs

### Breakpoints
```css
Mobile:   < 640px
Tablet:   640px - 1024px
Desktop:  1024px - 1440px
Ultra:    > 1440px
```

### Fluid Typography
Using Tailwind's text size scaling:
- `text-sm` (14px) → `text-base` (16px) → `text-lg` (18px)
- `text-2xl` (24px) → `text-3xl` (30px) → `text-4xl` (36px)
- `text-5xl` (48px) → `text-6xl` (60px) → `text-7xl` (72px)

### Mobile-First Approach
1. Design for mobile first (320px)
2. Add `sm:` (640px) for tablet enhancements
3. Add `lg:` (1024px) for desktop layouts
4. No desktop-first media queries

---

## SEO Optimization

### Meta Tags
```html
<title>About StonesLand | Authentic Gemstones & Minerals</title>
<meta name="description" content="...">
<meta name="keywords" content="...">
```

### Semantic HTML
- `<section>` for each major component
- `<h1>` for page title
- `<h2>` for section headers
- `<h3>` for subsection titles
- `<article>` for blog posts
- `<header>`, `<footer>`, `<main>`, `<nav>`

### Structured Data (JSON-LD)
- **Organization Schema:** Company name, logo, contact, founding date
- **Person Schema:** Team members with roles and bios
- **LocalBusiness Schema:** Address, phone, hours (if applicable)

### Open Graph
- og:title, og:description, og:image
- og:url (canonical)
- twitter:card for social sharing

### Image Alt Text
- Descriptive, keyword-rich
- Example: "Sarah Johnson, Founder & CEO of StonesLand"

---

## Performance Optimization

### Image Loading
- Lazy load images below the fold
- Use WebP with PNG fallback
- Compress images to <100KB each
- Responsive image sizes (srcset)

### Code Splitting
- Each section is a separate component
- Dynamic imports for below-the-fold content
- CSS-in-JS with Tailwind (no extra CSS file)

### Animations
- GPU-accelerated (transform, opacity)
- Intersection Observer for scroll-triggered animations
- `will-change` property for smooth transitions
- Debounced scroll listeners

### Target Metrics
- **Lighthouse Score:** 90+
- **First Contentful Paint (FCP):** <1.8s
- **Largest Contentful Paint (LCP):** <2.5s
- **Cumulative Layout Shift (CLS):** <0.1

---

## Accessibility (WCAG 2.1 AA)

### Color Contrast
- Text vs background: Minimum 4.5:1
- Large text (18px+): Minimum 3:1
- Icons: Sufficient contrast with background

### Keyboard Navigation
- Tab order follows logical flow
- Skip-to-main-content link at top
- All interactive elements keyboard-accessible
- `:focus-visible` styles for keyboard users

### ARIA Labels
- Icons have `aria-label` or `title`
- Forms have proper `<label>` elements
- Social links labeled with platform name
- Sections have `aria-label` describing purpose

### Semantic HTML
- Proper heading hierarchy (h1 → h2 → h3)
- `<section>` elements with `aria-label`
- `<article>` for blog posts
- Meaningful link text (not "click here")

### Testing Tools
- Lighthouse Accessibility Audit
- axe DevTools Chrome Extension
- WAVE (Web Accessibility Evaluation Tool)
- Screen reader testing (NVDA, JAWS)

---

## Data Structure

### companyInfo
```typescript
{
  name: 'StonesLand',
  tagline: 'Discover the World\'s Finest Gemstones & Minerals',
  mission: 'Full mission statement...',
  founded: 2015,
  yearInBusiness: 9,
}
```

### timeline
```typescript
{
  year: 2015,
  title: 'Company Founded',
  description: 'Brief description...',
  icon: '🌍',
}[]
```

### values
```typescript
{
  title: 'Authenticity',
  description: 'Full description...',
  icon: '✓',
  color: 'from-sapphire-500 to-sapphire-600',
}[]
```

### teamMembers
```typescript
{
  name: 'Sarah Johnson',
  role: 'Founder & CEO',
  bio: 'Brief bio...',
  image: '/team/sarah.jpg',
  social: {
    linkedin?: string,
    twitter?: string,
    github?: string,
  }
}[]
```

### trustBadges
```typescript
{
  icon: '👥',
  stat: '50,000+',
  label: 'Satisfied Customers',
  description: '...',
}[]
```

---

## Usage

### Add Custom Content
1. Edit `/src/data/aboutData.ts` with your company info
2. Update team members, timeline, values
3. Page automatically renders with new content

### Replace Placeholder Images
1. Add team photos to `/public/team/` directory
2. Update `image` paths in `teamMembers`
3. Add certification logos to `/public/certs/`

### Customize Colors
Update Tailwind classes in components:
- `from-sapphire-600` → your primary color
- `from-amethyst-500` → your accent color
- Color palette: sapphire, amethyst, emerald, golden

### Add More Sections
Create new component in `/src/components/about/`
Import and add to `/src/app/about/page.tsx`

---

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Performance Checklist
- [ ] Images optimized (<100KB each)
- [ ] Lazy loading implemented
- [ ] Lighthouse score >90
- [ ] Mobile viewport tests pass
- [ ] Accessibility audit passes
- [ ] Social meta tags verified
- [ ] Canonical URL set
- [ ] Structured data validated (schema.org)
