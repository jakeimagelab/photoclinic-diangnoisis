import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFF7F1] text-[#155855]">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-6 rounded-full border border-[#E85D2C]/20 bg-white px-5 py-2 text-sm font-medium text-[#E85D2C] shadow-sm">
          PHOTOCLINIC HOSPITAL PHOTO DIAGNOSIS
        </div>

        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-[-0.04em] text-[#155855] md:text-6xl">
          우리 병원은 지금
          <br />
          어떤 사진이 필요할까요?
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#155855]/75 md:text-xl">
          개원, 리뉴얼, 홈페이지 제작, SNS 운영까지.
          <br className="hidden md:block" />
          병원의 현재 상황에 맞는 촬영 방향과 필요한 콘텐츠를
          3분 안에 진단해드립니다.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/diagnosis"
            className="rounded-full bg-[#E85D2C] px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:bg-[#d94f22]"
          >
            우리 병원 사진 진단하기
          </Link>

          <p className="text-sm text-[#155855]/60">
            진단 후 병원사진 촬영 처방전과 추천 구성을 확인할 수 있습니다.
          </p>
        </div>

        <div className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 text-left shadow-sm">
            <p className="text-sm font-semibold text-[#E85D2C]">01</p>
            <h3 className="mt-2 text-lg font-bold">병원 상황 진단</h3>
            <p className="mt-2 text-sm leading-6 text-[#155855]/70">
              개원, 리뉴얼, 정기 콘텐츠 등 현재 필요한 단계를 확인합니다.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 text-left shadow-sm">
            <p className="text-sm font-semibold text-[#E85D2C]">02</p>
            <h3 className="mt-2 text-lg font-bold">촬영 방향 분석</h3>
            <p className="mt-2 text-sm leading-6 text-[#155855]/70">
              의료진, 공간, 진료연출, 홈페이지/SNS 사용 목적을 정리합니다.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 text-left shadow-sm">
            <p className="text-sm font-semibold text-[#E85D2C]">03</p>
            <h3 className="mt-2 text-lg font-bold">촬영 처방전 확인</h3>
            <p className="mt-2 text-sm leading-6 text-[#155855]/70">
              우리 병원에 필요한 사진 구성과 추천 패키지를 확인합니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
