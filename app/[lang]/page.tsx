import LandingPage from "./LandingPage";

export default async function LangPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <LandingPage lang={lang} />;
}
