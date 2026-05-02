import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "포토클리닉 진단 · 우리 병원에 꼭 맞는 콘텐츠 찾기",
  description:
    "3분 진단으로 우리 병원의 브랜딩 방향을 확인하세요. 포토클리닉이 함께한 병원의 데이터 기반.",
  openGraph: {
    title: "포토클리닉 맞춤 진단",
    description: "병원 전문 사진·영상 에이전시 포토클리닉의 3분 브랜딩 진단",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#E5F0EE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang="ko">
      <body className="bg-base text-primary min-h-screen">
        {children}
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
