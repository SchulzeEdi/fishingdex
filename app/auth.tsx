import { Redirect } from 'expo-router';

import { deviceLocale } from '@/app-init';
import { useSessionStatus } from '@/entities/user';
import { AuthScreen } from '@/views';

export default function AuthRoute() {
  const status = useSessionStatus();
  if (status === 'signedIn') return <Redirect href="/" />;
  return <AuthScreen deviceRegion={deviceLocale().region} />;
}
