import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";

export const metadata: Metadata = {
  title: "satgat · 삿갓",
  description: "자연어를 한지 감성의 한국 문서, 차트, 도표로 옮겨 적는 한국형 AI 문서 생성기.",
};

export default async function SatgatLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <div className="satgat-shell">
      <SiteHeader lang={lang} />
      {children}
    </div>
  );
}
