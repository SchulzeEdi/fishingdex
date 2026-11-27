import { useLocalSearchParams } from 'expo-router';

import { SpeciesScreen } from '@/views';

export default function SpeciesRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SpeciesScreen speciesId={id ?? ''} />;
}
