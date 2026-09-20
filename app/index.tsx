import { StatusBar } from 'expo-status-bar';

import { DexScreen } from '@/views';

export default function Home() {
  return (
    <>
      <StatusBar style="auto" />
      <DexScreen />
    </>
  );
}
