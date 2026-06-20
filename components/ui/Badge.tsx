import { cn } from '@/lib/utils';
import type { BookingStatus, ClaimStatus, PaymentStatus } from '@/types';

type BadgeVariant = 'pending' | 'confirmed' | 'paid' | 'forgiven' | 'error' | 'synced' | 'disconnected' | 'checked_in' | 'checked_out' | 'cancelled' | 'extension_requested' | 'approved_extension' | 'critical' | 'high' | 'medium' | 'low';
type StatusVariant = Extract<BookingStatus | ClaimStatus | PaymentStatus, BadgeVariant>;

const variantMap: Record<BadgeVariant, string> = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-hs-green/15 text-hs-green border-hs-green/30',
  paid: 'bg-hs-green/15 text-hs-green border-hs-green/30',
  synced: 'bg-hs-green/15 text-hs-green border-hs-green/30',
  forgiven: 'bg-hs-purple/15 text-hs-purple border-hs-purple/30',
  error: 'bg-hs-red/15 text-hs-red border-hs-red/30',
  disconnected: 'bg-hs-red/15 text-hs-red border-hs-red/30',
  cancelled: 'bg-hs-red/15 text-hs-red border-hs-red/30',
  checked_in: 'bg-hs-blue/15 text-hs-blue border-hs-blue/30',
  checked_out: 'bg-hs-muted/20 text-hs-muted border-hs-muted/30',
  extension_requested: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  approved_extension: 'bg-hs-blue/15 text-hs-blue border-hs-blue/30',
  critical: 'bg-hs-red/15 text-hs-red border-hs-red/30',
  high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  medium: 'bg-hs-blue/15 text-hs-blue border-hs-blue/30',
  low: 'bg-hs-green/15 text-hs-green border-hs-green/30',
};

interface BadgeProps { variant: BadgeVariant | StatusVariant; label: string; className?: string; }

export function Badge({ variant, label, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border', variantMap[variant] ?? variantMap.pending, className)}>
      {label}
    </span>
  );
}

export function PlatformBadge({ platform }: { platform: string }) {
  const map: Record<string, string> = {
    airbnb: 'bg-[#FF5A5F]/15 text-[#FF5A5F] border-[#FF5A5F]/30',
    booking: 'bg-[#4a90d9]/15 text-[#4a90d9] border-[#4a90d9]/30',
    gatherin: 'bg-hs-primary/15 text-hs-primary border-hs-primary/30',
    expedia: 'bg-[#1d4e89]/15 text-[#60a5fa] border-[#1d4e89]/30',
    direct: 'bg-hs-primary/15 text-hs-primary border-hs-primary/30',
    manual: 'bg-hs-blue/15 text-hs-blue border-hs-blue/30',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border capitalize', map[platform] ?? map.direct)}>
      {platform}
    </span>
  );
}
