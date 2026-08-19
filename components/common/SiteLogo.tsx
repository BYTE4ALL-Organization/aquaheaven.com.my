import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC, BRAND_NAME_UPPER } from '@/lib/brand';
import { integralCF } from '@/styles/fonts';

type SiteLogoProps = {
  className?: string;
  /** Navbar vs footer sizing */
  variant?: 'nav' | 'footer';
};

export default function SiteLogo({
  className,
  variant = 'nav',
}: SiteLogoProps) {
  const textClass =
    variant === 'footer'
      ? 'text-[28px] lg:text-[32px]'
      : 'text-2xl lg:text-[32px] mb-2';

  if (BRAND_LOGO_SRC) {
    const size = variant === 'footer' ? 40 : 36; // Square Size
    return (
      <Link href="/" className={cn('inline-flex items-center', className)}>
        <Image
          src={BRAND_LOGO_SRC}
          alt={BRAND_LOGO_ALT}
          width={size}
          height={size}
          className={cn(
            'h-8 lg:h-20 w-auto object-contain object-left',
            variant === 'footer' && 'h-9 lg:h-10'
          )}
          priority={variant === 'nav'}
        />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={cn([
        integralCF.className,
        textClass,
        'bg-gradient-to-r from-brand to-brand-accent bg-clip-text text-transparent',
        className,
      ])}
    >
      {BRAND_NAME_UPPER}
    </Link>
  );
}
