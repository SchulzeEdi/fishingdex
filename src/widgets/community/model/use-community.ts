import { useMemo } from 'react';

import {
  LOCAL_USER_ID,
  sampleCommunityCatches,
  sortByRecent,
  useLikedIds,
  useMyCatches,
  type CommunityCatch,
} from '@/entities/catch';
import { useProfile } from '@/entities/user';
import { buildLeaderboard, isRankingEligible, type LeaderboardScope } from '@/features/ranking';

export interface FeedItem extends CommunityCatch {
  liked: boolean;
  isMine: boolean;
}

/**
 * Capturas que o app mostra no feed/ranking: as do usuário (deste aparelho) + exemplos da
 * comunidade, até a API (getFeed/getRanking) substituir os exemplos — DT-04.
 */
export function useCommunityFeed(): FeedItem[] {
  const mine = useMyCatches();
  const liked = useLikedIds();
  const profile = useProfile();
  const samples = useMemo(() => sampleCommunityCatches(), []);

  return useMemo(() => {
    const own: CommunityCatch[] = mine.map((c) => ({
      ...c,
      authorName: profile?.name ?? '',
      authorCountry: profile?.country ?? '',
      likes: 0,
    }));
    return sortByRecent([...own, ...samples]).map((c) => {
      const isLiked = liked.includes(c.id);
      return { ...c, liked: isLiked, isMine: c.userId === LOCAL_USER_ID, likes: c.likes + (isLiked ? 1 : 0) };
    });
  }, [mine, liked, profile, samples]);
}

/** Ranking local: capturas do usuário só entram com foto e públicas (regra do backend). */
export function useLeaderboard(scope: LeaderboardScope) {
  const feed = useCommunityFeed();
  return useMemo(
    () =>
      buildLeaderboard(
        feed
          .filter((c) => (c.isMine ? isRankingEligible(c) : !c.isPrivate))
          .map((c) => ({
            id: c.id,
            userId: c.userId,
            authorName: c.authorName,
            country: c.authorCountry || null,
            speciesId: c.speciesId,
            sizeCm: c.sizeCm,
            caughtAt: c.caughtAt,
            photoUrl: c.photoUrl ?? null,
          })),
        scope,
      ),
    [feed, scope],
  );
}
