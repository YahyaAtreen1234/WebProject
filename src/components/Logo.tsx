'use client';

import Link from 'next/link';

/**
 * StonesLand brand mark.
 *
 * public/logo.png is a square lockup: the SL monogram sits in the upper area
 * with the STONESLAND wordmark beneath it, on a baked-in black background.
 *
 * - variant="mark" crops to just the monogram, so small header slots get a
 *   crisp badge instead of an illegible miniature of the whole lockup. The
 *   black tile is kept deliberately — it matches the artwork and reads as
 *   intentional on light backgrounds.
 * - variant="full" shows the complete lockup, for dark surfaces with room
 *   for it (footer, sign-in screens).
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

// The monogram occupies roughly x 34-71%, y 19-63% of the square artwork.
// Drawing the image at 2x the badge and offsetting by these amounts centres
// that region: left = 50% - centreX * 200%, top = 50% - centreY * 200%.
const MARK_SCALE = '200%';
const MARK_LEFT = '-55%';
const MARK_TOP = '-32%';

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
  const content =
    variant === 'full' ? (
      <img
        src="/logo.png"
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
          <img
            src="/logo.png"
            alt="StonesLand"
            className="absolute max-w-none"
            style={{ width: MARK_SCALE, height: MARK_SCALE, left: MARK_LEFT, top: MARK_TOP }}
          />
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
