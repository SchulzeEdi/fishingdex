import { useLocalSearchParams } from 'expo-router';

import { RegisterCatchScreen } from '@/views';

export default function RegisterRoute() {
  const { species } = useLocalSearchParams<{ species?: string }>();
  return <RegisterCatchScreen initialSpeciesId={species} />;
}
