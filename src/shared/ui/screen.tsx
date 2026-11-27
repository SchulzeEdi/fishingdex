import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { AppText } from './text';
import { useTheme } from './theme';
import { size, spacing } from './tokens';

interface ScreenProps {
  children: ReactNode;
  /** Rola o conteúdo (telas de formulário/perfil). Listas usam FlatList própria. */
  scroll?: boolean;
  edges?: Edge[];
  /** Espaço extra no fim (tab bar). */
  bottomInset?: number;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
}

/**
 * Moldura de tela: fundo background, margem lateral space-lg e coluna de no máximo
 * content-max (480px) centralizada no web/tablet.
 */
export function Screen({
  children,
  scroll,
  edges = ['top'],
  bottomInset = 0,
  keyboardShouldPersistTaps,
}: ScreenProps) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: colors.background }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.column, styles.padded, { paddingBottom: spacing.xl + bottomInset }]}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.column, styles.fill]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

/** Um title por tela, com subtítulo em label + text-muted. */
export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <AppText variant="title" accessibilityRole="header">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="label" tone="textMuted" style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right}
    </View>
  );
}

/** Largura máxima da coluna, para listas que precisam da mesma moldura. */
export const columnStyle = { width: '100%', maxWidth: size.contentMax, alignSelf: 'center' } as const;

const styles = StyleSheet.create({
  root: { flex: 1 },
  column: columnStyle,
  fill: { flex: 1 },
  padded: { paddingHorizontal: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerText: { flex: 1 },
  subtitle: { marginTop: spacing.xs },
});
