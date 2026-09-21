import { StatusBar } from 'expo-status-bar';

import { FeedScreen } from '@/views';

export default function FeedTab() {
  return (
    <>
      <StatusBar style="auto" />
      <FeedScreen />
    </>
  );
}
