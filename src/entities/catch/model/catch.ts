/** Uma captura registrada por um usuário (D-2: espécie escolhida manualmente). */
export interface Catch {
  id: string;
  userId: string;
  speciesId: string;
  /** Tamanho em cm — obrigatório para valer no ranking (D-6). */
  sizeCm: number;
  weightKg?: number;
  /** ISO 8601. */
  caughtAt: string;
  /** Local privado não expõe localização aos outros. */
  isPrivate: boolean;
  /** Foto da captura — obrigatória para o ranking (comprovação, D-6). */
  photoUrl?: string | null;
  /** Setup: isca usada. */
  bait?: string;
  /** Nome do local (nunca exibido se privado). */
  place?: string;
}

/** Captura de outro pescador como aparece no feed/ranking. */
export interface CommunityCatch extends Catch {
  authorName: string;
  authorCountry: string;
  likes: number;
}
