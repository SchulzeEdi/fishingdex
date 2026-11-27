import { StyleSheet, View } from 'react-native';

import { Button } from './button';
import { Icon } from './icon/icon';
import type { IconName } from './icon/icons';
import { AppText } from './text';
import { useTheme } from './theme';
import { radius, spacing } from './tokens';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Vazio: ação primária. Erro/sem conexão: secundária ("Tentar de novo"). */
  actionVariant?: 'primary' | 'secondary';
}

/** Tela ou seção sem conteúdo, ou com erro de carregamento. */
export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  actionVariant = 'primary',
}: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.root}>
      <View style={[styles.mark, { backgroundColor: colors.surfaceMuted }]}>
        <Icon name={icon} size={30} color={colors.primary} />
      </View>
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      <AppText tone="textMuted" align="center" style={styles.message}>
        {message}
      </AppText>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant={actionVariant} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.lg,
  },
  mark: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  message: { maxWidth: 280, marginBottom: spacing.sm },
  action: { alignSelf: 'center' },
});
