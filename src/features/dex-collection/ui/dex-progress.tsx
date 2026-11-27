import { StyleSheet, View } from 'react-native';

import { useI18n } from '@/shared/i18n';
import { AppText, ProgressBar, fonts, spacing, textStyles } from '@/shared/ui';

interface DexProgressBarProps {
  unlocked: number;
  total: number;
  percent: number;
}

/** Progresso da coleção: número grande (Sora 30 tabular) + total + % + barra. */
export function DexProgressBar({ unlocked, total, percent }: DexProgressBarProps) {
  const { t } = useI18n();
  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <View style={styles.count}>
          <AppText tabular style={styles.big}>
            {unlocked}
          </AppText>
          <AppText variant="label" tone="textMuted">
            {t('dex.ofTotal', { total })}
          </AppText>
        </View>
        <AppText tone="primary" tabular style={styles.pct}>
          {percent}%
        </AppText>
      </View>
      <ProgressBar
        percent={percent}
        now={unlocked}
        max={total}
        accessibilityLabel={t('dex.progress', { unlocked, total })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm },
  top: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  count: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  big: { fontFamily: fonts.display700, fontSize: 30, lineHeight: 36 },
  pct: { fontFamily: textStyles.bodyStrong.fontFamily, fontSize: 14, lineHeight: 20 },
});
