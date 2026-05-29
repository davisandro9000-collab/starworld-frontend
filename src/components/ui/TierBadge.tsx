// src/components/ui/TierBadge.tsx

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
  /**
   * Can be a string ('bronze', 'silver', 'platinum')
   * or an object returned by the backend: { slug: 'bronze', name: 'Bronze', colorHex: '#CD7F32' }
   */
  tier: TierSlug | { slug?: TierSlug; name?: string; colorHex?: string };
  showDot?: boolean;
}

export default function TierBadge({ tier, showDot = false }: TierBadgeProps) {
  // Normalise to a slug
  let slug: TierSlug = 'bronze';
  if (typeof tier === 'string') {
    slug = tier as TierSlug;
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