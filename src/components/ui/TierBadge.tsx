type TierSlug = 'bronze' | 'silver' | 'platinum';

const TIER_STYLES: Record<TierSlug, string> = {
  bronze:   'badge-bronze',
  silver:   'badge-silver',
  platinum: 'badge-platinum',
};

const TIER_ICONS: Record<TierSlug, string> = {
  bronze:   '🥉',
  silver:   '🥈',
  platinum: '💎',
};

export interface TierBadgeProps {
  tier: TierSlug | { slug?: TierSlug; name?: string; colorHex?: string } | string;
  showDot?: boolean;
}

export default function TierBadge({ tier, showDot = false }: TierBadgeProps) {
  let slug: TierSlug = 'bronze';
  if (typeof tier === 'string') {
    slug = (tier as TierSlug) || 'bronze';
  } else {
    slug = (tier.slug as TierSlug) || 'bronze';
  }

  return (
    <span className={TIER_STYLES[slug]}>
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full inline-block"
          style={{ backgroundColor: 'currentColor' }}
          aria-hidden="true"
        />
      )}
      {TIER_ICONS[slug]}
      <span className="ml-0.5">{slug.charAt(0).toUpperCase() + slug.slice(1)}</span>
    </span>
  );
}