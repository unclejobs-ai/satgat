import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "satgat · 삿갓",
  description: "자연어를 한지 감성의 이력서, 제안서, 명함, 포트폴리오로 옮겨 적는 한국형 AI 문서 생성기.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
