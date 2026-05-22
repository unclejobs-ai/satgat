import { redirect } from 'next/navigation';

/**
 * 루트 → 한국어 specimen (Phase 1 한국어 전용)
 */
export default function RootRedirect() {
  redirect('/ko');
}
