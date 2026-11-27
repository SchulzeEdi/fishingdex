import type { Plan } from '@/entities/user';
import { useI18n } from '@/shared/i18n';
import { Badge } from '@/shared/ui';

/** Selo do plano: Free com contorno (legível), Pro em primary com estrela. */
export function PlanBadge({ plan }: { plan: Plan }) {
  const { t } = useI18n();
  return plan === 'pro' ? (
    <Badge label={t('plan.pro')} tone="primary" icon="star-fill" />
  ) : (
    <Badge label={t('plan.free')} tone="muted" />
  );
}
