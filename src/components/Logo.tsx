'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * StonesLand brand mark.
 *
 * public/logo.png is a square lockup: the triangular S mark sits in the upper
 * area with the STONES LAND wordmark beneath it, on a baked-in black
 * background.
 *
 * - variant="mark" crops to just the triangular mark, so small header slots get
 *   a crisp badge instead of an illegible miniature of the whole lockup. The
 *   black tile is kept deliberately — it matches the artwork and reads as
 *   intentional on light backgrounds.
 * - variant="full" shows the complete lockup, for dark surfaces with room for
 *   it (footer, sign-in screens).
 *
 * A logo uploaded through Admin → Settings overrides the bundled file. It is
 * never cropped: the crop below is measured against this specific artwork, and
 * applying it to an arbitrary upload would slice the middle out of it.
 */

interface LogoProps {
  variant?: 'mark' | 'full';
  /** Rendered size in px: the badge edge for "mark", the width for "full". */
  size?: number;
  /** Wraps the logo in a link. Pass null to render it unlinked. */
  href?: string | null;
  /** Text shown beside a "mark" badge. */
  label?: string;
  tagline?: string;
  labelClassName?: string;
  taglineClassName?: string;
  className?: string;
}

const FALLBACK_SRC = '/logo.png';

// Measured off the artwork rather than eyeballed: the triangular mark occupies
// x 20.5-80.3%, y 18.8-63.2%, and the STONES LAND wordmark begins at y 70.5%.
//
// These three values frame x 20.1-81.1%, y 8.5-69.5% — enclosing the mark on
// all sides while stopping 1% short of the wordmark. The window is square, and
// the mark is wider (59.8%) than the space above the wordmark allows to spare,
// so there is little slack here: widening the crop pulls the top of the
// lettering into the badge, and tightening it clips the diagonal arm tips.
const MARK_SCALE = '164%';
const MARK_LEFT = '-33%';
const MARK_TOP = '-14%';

/**
 * Logo renders in the header, the footer and the auth drawer at once, so the
 * settings lookup is shared: one request per page load regardless of how many
 * instances mount, and subsequent mounts read the resolved value synchronously.
 */
let cachedLogo: string | null | undefined;
let inFlight: Promise<string | null> | null = null;

function loadCustomLogo(): Promise<string | null> {
  if (cachedLogo !== undefined) return Promise.resolve(cachedLogo ?? null);
  if (inFlight) return inFlight;

  const request: Promise<string | null> = fetch('/api/public/settings')
    .then((res) => (res.ok ? res.json() : null))
    .then((settings) => {
      const logo: string | null = settings?.logo || null;
      cachedLogo = logo;
      return logo;
    })
    .catch(() => {
      // Branding must not depend on the settings table being reachable.
      cachedLogo = null;
      return null;
    })
    .finally(() => {
      inFlight = null;
    });

  inFlight = request;
  return request;
}

export default function Logo({
  variant = 'mark',
  size = 44,
  href = '/',
  label,
  tagline,
  labelClassName = 'text-lg sm:text-xl font-bold text-black',
  taglineClassName = 'text-xs sm:text-sm text-gray-600',
  className = '',
}: LogoProps) {
  const [customLogo, setCustomLogo] = useState<string | null>(cachedLogo ?? null);

  useEffect(() => {
    if (cachedLogo !== undefined) {
      setCustomLogo(cachedLogo);
      return;
    }

    let active = true;
    loadCustomLogo().then((logo) => {
      if (active) setCustomLogo(logo);
    });

    return () => {
      active = false;
    };
  }, []);

  const src = customLogo || FALLBACK_SRC;
  const isCustom = Boolean(customLogo);

  const content =
    variant === 'full' ? (
      <img
        src={src}
        alt="StonesLand"
        width={size}
        height={size}
        className="block h-auto rounded-lg"
        style={{ width: size }}
      />
    ) : (
      <span className={`flex items-center gap-3 ${className}`}>
        <span
          className="relative block flex-shrink-0 overflow-hidden rounded-lg bg-black"
          style={{ width: size, height: size }}
        >
          {isCustom ? (
            // Composition unknown — show the whole thing rather than guessing.
            <img
              src={src}
              alt="StonesLand"
              className="absolute inset-0 h-full w-full object-contain"
            />
          ) : (
            <img
              src={src}
              alt="StonesLand"
              className="absolute max-w-none"
              style={{
                width: MARK_SCALE,
                height: MARK_SCALE,
                left: MARK_LEFT,
                top: MARK_TOP,
              }}
            />
          )}
        </span>
        {(label || tagline) && (
          <span className="flex flex-col leading-tight">
            {label && <span className={labelClassName}>{label}</span>}
            {tagline && <span className={taglineClassName}>{tagline}</span>}
          </span>
        )}
      </span>
    );

  const wrapped = variant === 'full' ? <span className={className}>{content}</span> : content;

  if (!href) return wrapped;

  return (
    <Link href={href} className="flex-shrink-0">
      {wrapped}
    </Link>
  );
}
