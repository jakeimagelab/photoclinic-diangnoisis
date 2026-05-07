"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import PackageRecommendation from "@/components/PackageRecommendation";
import CaseStudyCard from "@/components/CaseStudyCard";
import { useDiagnosis } from "@/lib/store";
import { recommend } from "@/lib/recommendation";

const CASES = [
  { name: "트리니티여성의원", dept: "산부인과", desc: "따뜻하고 부드러운 이미지로 리브랜딩" },
  { name: "르블랑치과", dept: "치과", desc: "공간의 감성을 사진으로 완성" },
  { name: "진주마음우산정신건강의학과", dept: "정신건강의학과", desc: "병원의 감성을 섬세하게 기록" },
];

export default function ResultPage() {
  const router = useRouter();
  const { answers, reset } = useDiagnosis();
  const [optin, setOptin] = useState(true);

  useEffect(() => {
    document.body.classList.add("phase-result");
    return () => {
      document.body.classList.remove("phase-result");
    };
  }, []);

  useEffect(() => {
    if (!answers.hospitalName) {
      const t = setTimeout(() => router.push("/"), 600);
      return () => clearTimeout(t);
    }
  }, [answers.hospitalName, router]);

  const rec = useMemo(() => recommend(answers), [answers]);

  return (
    <main className="relative min-h-screen bg-base">
      <header className="px-9 pt-7 flex items-center justify-between">
        <Logo />
        <div className="text-[13px] tracking-wider2 text-muted font-medium">DIAGNOSIS · RESULT</div>
      </header>

      <section className="max-w-[980px] mx-auto px-9 pt-16 pb-32">
        <div>
          <div className="text-green text-[13px] tracking-wider2 mb-3.5 font-semibold">DIAGNOSIS COMPLETE</div>
          <h1 className="text-[26px] md:text-[48px] leading-[1.28] text-primary font-bold tracking-tight">
            <span className="text-green">{answers.hospitalName ?? "병원"}</span>은<br />
            <span className="text-orange">{rec.diagnosisType}</span>입니다.
          </h1>
          <p className="mt-6 text-base md:text-lg text-secondary leading-[1.8] max-w-[760px]">
            {rec.headline}
          </p>

          <div className="mt-7 flex flex-wrap gap-2 text-xs">
            {answers.department && <Chip>{answers.department}</Chip>}
            {answers.location && <Chip>{answers.location}</Chip>}
            {answers.stage && <Chip>{answers.stage}</Chip>}
            {answers.budget && <Chip>예산 {answers.budget}</Chip>}
            {answers.timeline && <Chip>진행 {answers.timeline}</Chip>}
          </div>
        </div>

        <div className="mt-14 grid md:grid-cols-[1.1fr_0.9fr] gap-6">
          <section className="rounded-[14px] border border-green-line bg-elev p-7 md:p-9">
            <div className="text-green text-xs tracking-wider2 mb-4 font-semibold">PHOTO PRESCRIPTION</div>
            <h2 className="text-[22px] text-primary font-bold tracking-tight">병원사진 촬영 처방전</h2>
            <p className="mt-4 text-secondary leading-[1.8]">{rec.summary}</p>
          </section>

          <section className="rounded-[14px] border border-line-soft bg-white/60 p-7 md:p-9">
            <div className="text-orange text-xs tracking-wider2 mb-4 font-semibold">CHECK POINT</div>
            <h2 className="text-[22px] text-primary font-bold tracking-tight">보완해야 할 지점</h2>
            <ul className="mt-4 space-y-3">
              {rec.risks.map((risk) => (
                <li key={risk} className="flex gap-3 text-sm text-secondary leading-[1.7]">
                  <span className="mt-[10px] h-px w-4 bg-orange-soft shrink-0" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div style={{ marginTop: 72 }}>
          <div className="text-green text-xs tracking-wider2 mb-[22px] font-semibold">RECOMMENDED SHOTS</div>
          <h3 className="text-[22px] text-primary font-bold tracking-tight mb-6">우선 확보해야 할 사진 구성</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {rec.neededShots.map((shot, i) => (
              <div key={shot} className="rounded-[12px] border border-line-soft bg-elev p-5">
                <div className="text-orange text-[11px] tracking-wider2 font-bold">{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-3 text-sm text-primary font-semibold leading-[1.55]">{shot}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 88 }}>
          <div className="text-green text-xs tracking-wider2 mb-[22px] font-semibold">RECOMMENDED PACKAGE</div>
          <div className={`grid gap-6 ${rec.packages.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
            {rec.packages.map((p, i) => (
              <PackageRecommendation key={p} pkg={p} reason={rec.reasons[p]} index={i} primary={i === 0} />
            ))}
          </div>
          {rec.note && <p className="mt-5 text-sm text-muted">※ {rec.note}</p>}
        </div>

        <div style={{ marginTop: 88 }}>
          <div className="text-green text-xs tracking-wider2 mb-[22px] font-semibold">FEATURED PROJECTS</div>
          <h3 className="text-[22px] text-primary font-bold tracking-tight mb-6">포토클리닉 대표 병원 사례</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {CASES.map((c, i) => (
              <CaseStudyCard key={c.name} {...c} delay={0.1 + i * 0.08} />
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Link
              href="https://photoclinic.kr/#6page"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border-[1.5px] border-green text-green px-7 py-[14px] font-semibold rounded transition-all hover:bg-green hover:text-white hover:-translate-y-px"
            >
              <span>더 많은 포트폴리오 보기</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        <div className="rounded-[14px] border border-green-line bg-elev p-9 md:p-12" style={{ marginTop: 72 }}>
          <div className="text-green text-xs tracking-wider2 mb-[22px] font-semibold">NEXT STEP</div>
          <h3 className="text-xl md:text-[28px] text-primary font-bold leading-[1.4] tracking-tight">
            진단 결과를 바탕으로 <span className="text-green">촬영 방향 상담</span>을 이어가세요.
          </h3>
          <p className="mt-4 text-secondary leading-[1.8]">
            상담 시에는 이 결과를 기준으로 필요한 촬영 항목, 촬영 동선, 홈페이지·플레이스 활용 방식을 함께 정리하는 흐름이 좋습니다.
          </p>

          <label className="mt-7 flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={optin}
              onChange={(e) => setOptin(e.target.checked)}
              className="mt-1 h-4 w-4 accent-green"
              style={{ accentColor: "#0F5254" }}
            />
            <span className="text-sm text-secondary">
              사전 컨설팅 자료를 {answers.email ? `이메일(${answers.email})로` : "상담 시"} 받아보겠습니다.
            </span>
          </label>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="http://photoclinic.kr"
              target="_blank"
              className="inline-flex items-center gap-3 bg-green text-white px-8 py-[15px] font-semibold rounded transition-all hover:bg-green-2 hover:-translate-y-px shadow-[0_4px_18px_-4px_rgba(15,82,84,0.35)] hover:shadow-[0_8px_28px_-4px_rgba(15,82,84,0.5)]"
            >
              <span>포토클리닉 상담하기</span>
              <span>→</span>
            </Link>
            <button
              onClick={() => {
                reset();
                router.push("/");
              }}
              className="inline-flex items-center gap-2 border-[1.5px] border-line-soft text-secondary px-8 py-[15px] font-semibold rounded transition-all hover:border-green hover:text-green"
            >
              처음부터 다시
            </button>
          </div>
        </div>

        <div className="h-24" />
      </section>
    </main>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center px-3.5 py-1.5 border border-green-line rounded-full text-green bg-white/60 font-medium">{children}</span>;
}
