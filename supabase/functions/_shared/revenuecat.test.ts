import { describe, expect, it } from 'vitest';

import { isSupabaseUserId, planChangeFromEvent, planFromEntitlement, userIdOf } from './revenuecat';

const uid = '11111111-2222-3333-4444-555555555555';
const base = { app_user_id: uid, entitlement_ids: ['pro'], product_id: 'fishingdex_pro:monthly', expiration_at_ms: 1798761600000 };

describe('planChangeFromEvent', () => {
  it('compra, renovação e troca de plano dão Pro', () => {
    for (const type of ['INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION']) {
      expect(planChangeFromEvent({ ...base, type })).toMatchObject({ userId: uid, plan: 'pro', status: 'active' });
    }
  });

  it('expiração volta ao Free; cancelamento e problema de cobrança não tiram o Pro na hora', () => {
    expect(planChangeFromEvent({ ...base, type: 'EXPIRATION' })).toMatchObject({ plan: 'free', status: 'expired' });
    expect(planChangeFromEvent({ ...base, type: 'CANCELLATION' })).toMatchObject({ plan: null, status: 'canceled' });
    expect(planChangeFromEvent({ ...base, type: 'BILLING_ISSUE' })).toMatchObject({ plan: null, status: 'billing_issue' });
  });

  it('guarda produto e fim do período', () => {
    expect(planChangeFromEvent({ ...base, type: 'RENEWAL' })).toMatchObject({
      productId: 'fishingdex_pro:monthly',
      periodEnd: new Date(1798761600000).toISOString(),
    });
  });

  it('ignora teste, outro entitlement, usuário anônimo e tipo desconhecido', () => {
    expect(planChangeFromEvent({ ...base, type: 'TEST' })).toBeNull();
    expect(planChangeFromEvent({ ...base, type: 'RENEWAL', entitlement_ids: ['outro'] })).toBeNull();
    expect(planChangeFromEvent({ ...base, type: 'RENEWAL', app_user_id: '$RCAnonymousID:abc' })).toBeNull();
    expect(planChangeFromEvent({ ...base, type: 'SUBSCRIBER_ALIAS' })).toBeNull();
  });

  it('acha o id do Supabase nos aliases', () => {
    expect(userIdOf({ type: 'RENEWAL', app_user_id: '$RCAnonymousID:x', aliases: ['$RCAnonymousID:x', uid] })).toBe(uid);
    expect(isSupabaseUserId('nao-uuid')).toBe(false);
  });
});

describe('planFromEntitlement', () => {
  const now = new Date('2026-11-27T12:00:00Z');
  it('ativo, vitalício, expirado e ausente', () => {
    expect(planFromEntitlement({ expires_date: '2026-12-27T12:00:00Z' }, now)).toBe('pro');
    expect(planFromEntitlement({ expires_date: null }, now)).toBe('pro');
    expect(planFromEntitlement({ expires_date: '2026-11-01T00:00:00Z' }, now)).toBe('free');
    expect(planFromEntitlement(undefined, now)).toBe('free');
  });
});
