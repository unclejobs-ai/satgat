import PreviewClient from "./PreviewClient";
import { isDraftId } from "@/lib/preview/draft-id";

type PreviewPageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ draft?: string | string[] }>;
};


export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const [{ lang }, query] = await Promise.all([params, searchParams]);
  const draftParam = Array.isArray(query.draft) ? query.draft[0] : query.draft;
  const draftId = isDraftId(draftParam) ? draftParam : null;

  return <PreviewClient lang={lang} draftId={draftId} />;
}
