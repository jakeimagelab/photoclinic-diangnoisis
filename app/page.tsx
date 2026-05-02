"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";
import Logo from "@/components/Logo";

export default function Home() {
  // 인트로 진입 시 결과 단계 색상 토큰 초기화
  useEffect(() => {
    document.body.classList.remove("phase-result");
  }, []);

  return (
    <main className="relative min-h-screen bg-base">
      {/* 상단 메뉴 */}
      <header className="relative z-10 px-9 pt-7 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-[11px] tracking-wider2 text-muted font-medium">
          <span>DIRECTOR</span>
          <span>ABOUT</span>
          <span>PHILOSOPHY</span>
          <span>SERVICES</span>
          <span>PORTFOLIO</span>
          <span className="text-orange">DIAGNOSIS</span>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-9 pt-[120px] pb-40 max-w-[1040px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-[28px] md:text-[58px] leading-[1.28] font-bold text-primary tracking-tight">
            당신의 <span className="text-orange">병원</span>에 꼭 맞는<br />
            콘텐츠를 찾아드립니다.
          </h1>
          <p className="mt-8 text-base md:text-lg text-secondary leading-[1.8] max-w-[600px]">
            3분 진단으로 우리 병원의 브랜딩 방향을 확인해보세요.<br />
            포토클리닉이 함께해 온 <span className="text-green font-semibold">진심 컨텐츠</span>의 시작입니다.
          </p>

          <motion.div
            className="mt-13 flex flex-wrap items-center gap-6"
            style={{ marginTop: 52 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Link
              href="/diagnosis"
              className="group inline-flex items-center gap-3 bg-orange text-white px-[38px] py-[18px] text-base font-semibold rounded transition-all hover:bg-orange-2 hover:-translate-y-px shadow-[0_4px_18px_-4px_rgba(230,98,42,0.35)] hover:shadow-[0_8px_28px_-4px_rgba(230,98,42,0.5)]"
            >
              <span>진단 시작하기</span>
              <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              href="http://photoclinic.kr"
              target="_blank"
              className="text-sm text-muted hover:text-primary transition-colors underline-offset-4 hover:underline font-medium"
            >
              포토클리닉 홈페이지 보기
            </Link>
          </motion.div>

          <p className="mt-24 text-[13px] text-muted font-normal">
            ※ 포토클리닉이 함께한 병원의 데이터 기반
          </p>
        </motion.div>
      </section>
    </main>
  );
}
