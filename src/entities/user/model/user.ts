export type Plan = 'free' | 'pro';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  country?: string | null;
  plan: Plan;
}
