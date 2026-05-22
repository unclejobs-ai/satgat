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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500;1,600&family=Gowun+Batang:wght@400;700&family=Gowun+Dodum&family=Nanum+Myeongjo:wght@400;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/satgat/overrides.css" />
      </head>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
