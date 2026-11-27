import { useLocalSearchParams } from 'expo-router';

import { deviceLocale } from '@/app-init';
import { OnboardingScreen } from '@/views';

export default function OnboardingRoute() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  return <OnboardingScreen editing={edit === '1'} deviceRegion={deviceLocale().region} />;
}
