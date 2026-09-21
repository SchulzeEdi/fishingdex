import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import type { Plan } from '@/entities/user';
import { canViewSocial, remainingCatches } from '@/features/subscribe-pro';
import { resolveLocale, translate } from '@/shared/i18n';
import { darkTheme, lightTheme, radius, spacing, type Theme } from '@/shared/ui';

// Mock até auth/API (DT-04). Troque `plan` para 'pro' para ver o estado assinante.
const MOCK_USER = { name: 'Rafael Souza', country: '🇧🇷', plan: 'free' as Plan, catches: 2 };

export function ProfileScreen() {
  const theme = useColorScheme() === 'dark' ? darkTheme : lightTheme;
  const lang = resolveLocale('pt-BR');
  const s = makeStyles(theme);
  const isPro = canViewSocial(MOCK_USER.plan);
  const left = remainingCatches(MOCK_USER.plan, MOCK_USER.catches);

  return (
    <View style={s.container}>
      <View style={s.avatar}>
        <Text style={{ fontSize: 36 }}>🎣</Text>
      </View>
      <Text style={s.name}>
        {MOCK_USER.name} {MOCK_USER.country}
      </Text>
      <View style={[s.badge, isPro ? s.badgePro : s.badgeFree]}>
        <Text style={s.badgeText}>{isPro ? 'PRO' : 'FREE'}</Text>
      </View>

      {!isPro && (
        <View style={s.paywall}>
          <Text style={s.paywallText}>
            {left > 0
              ? `Você tem ${left} captura(s) grátis este mês.`
              : 'Limite grátis do mês atingido.'}
          </Text>
          <Text style={s.paywallSub}>Feed e ranking são do Pro.</Text>
          <Pressable style={s.cta}>
            <Text style={s.ctaText}>{translate(lang, 'paywall.cta')}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.background, padding: spacing.lg, alignItems: 'center' },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: radius.full,
      backgroundColor: t.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.xl,
    },
    name: { color: t.text, fontSize: 20, fontWeight: '700', marginTop: spacing.md },
    badge: { borderRadius: radius.full, paddingVertical: 4, paddingHorizontal: 12, marginTop: spacing.sm },
    badgePro: { backgroundColor: t.primary },
    badgeFree: { backgroundColor: t.surfaceMuted },
    badgeText: { color: t.primaryFg, fontWeight: '700', fontSize: 12 },
    paywall: {
      marginTop: spacing.xl,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: radius.lg,
      padding: spacing.lg,
      alignItems: 'center',
      alignSelf: 'stretch',
    },
    paywallText: { color: t.text, fontSize: 15, fontWeight: '600', textAlign: 'center' },
    paywallSub: { color: t.textMuted, fontSize: 13, marginTop: spacing.xs, marginBottom: spacing.md },
    cta: {
      backgroundColor: t.highlight,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
    },
    ctaText: { color: t.highlightFg, fontWeight: '700', fontSize: 15 },
  });
}
