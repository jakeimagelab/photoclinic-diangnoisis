import Link from "next/link";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#e6f0ef] text-[#155855]">
      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        {/* Logo */}
        <header className="flex items-center justify-between">
          <Logo />
        </header>

        {/* Hero */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-6 rounded-full border border-[#E85D2C]/20 bg-white px-5 py-2 text-sm font-medium text-[#E85D2C] shadow-sm">
            포토클리닉 병원이미지 진단
          </div>

          <h1 className="max-w-4xl text-[46px] font-bold leading-[1.22] tracking-[-0.04em] text-[#155855] md:text-[69px]">
            우리 병원은 지금
            <br />
            어떤 사진이 필요할까요?
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#155855]/75 md:text-xl">
            개원, 리뉴얼, 홈페이지 제작, SNS 운영까지.
            <br className="hidden md:block" />
            병원의 현재 상황에 맞는 촬영 방향과 필요한 콘텐츠를 3분 안에
            진단해드립니다.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/diagnosis"
              className="rounded-full bg-[#E85D2C] px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:bg-[#d94f22]"
            >
              우리 병원 사진 진단하기
            </Link>

            <Link
              href="https://photoclinic.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[#155855]/25 bg-white px-8 py-4 text-lg font-semibold text-[#155855] shadow-sm transition hover:scale-[1.02] hover:border-[#155855]/50 hover:bg-white/80"
            >
              포토클리닉 홈페이지
            </Link>
          </div>

          <p className="mt-4 text-sm text-[#155855]/60">
            진단 후 병원사진 촬영 처방전과 추천 구성을 확인할 수 있습니다.
          </p>

          {/* Cards */}
          <div className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-gray-300 bg-white/90 p-6 text-left shadow-sm">
              <p className="text-sm font-semibold text-[#E85D2C]">01</p>
              <h3 className="mt-2 text-lg font-bold text-[#155855]">
                병원상황진단
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#155855]/70">
                개원, 리뉴얼, 정기 콘텐츠 등 현재 필요한 단계를 확인합니다.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-300 bg-white/90 p-6 text-left shadow-sm">
              <p className="text-sm font-semibold text-[#E85D2C]">02</p>
              <h3 className="mt-2 text-lg font-bold text-[#155855]">
                촬영 방향 분석
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#155855]/70">
                의료진, 공간, 진료연출, 홈페이지/SNS 사용 목적을 정리합니다.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-300 bg-white/90 p-6 text-left shadow-sm">
              <p className="text-sm font-semibold text-[#E85D2C]">03</p>
              <h3 className="mt-2 text-lg font-bold text-[#155855]">
                촬영 처방전 확인
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#155855]/70">
                우리 병원에 필요한 사진 구성과 추천 패키지를 확인합니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
