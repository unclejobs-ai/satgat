/**
 * /[lang] (예: /ko) — next.config.ts rewrites가 정적 specimen으로 매핑.
 * 라우터 fallback 도달 시 specimen으로 리다이렉트.
 */

import { redirect } from 'next/navigation';

export default async function LangFallback({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  await params;
  redirect('/satgat/satgat-ko.html');
}
