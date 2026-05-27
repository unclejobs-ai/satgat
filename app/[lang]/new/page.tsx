import NewDocumentClient from "./NewDocumentClient";

type NewDocumentPageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ template?: string | string[] }>;
};

export default async function NewDocumentPage({
  params,
  searchParams,
}: NewDocumentPageProps) {
  const [{ lang }, query] = await Promise.all([params, searchParams]);
  const templateParam = Array.isArray(query.template) ? query.template[0] : query.template;

  return <NewDocumentClient lang={lang} preselectedTemplate={templateParam ?? null} />;
}
