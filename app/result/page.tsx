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
    return () => { document.body.classList.remove("phase-result"); };
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
        <div className="text-[13px] tracking-wider2 text-muted font-medium">
          DIAGNOSIS · RESULT
        </div>
      </header>

      <section className="max-w-[960px] mx-auto px-9 pt-16 pb-32">
        <div>
          <div className="text-green text-[13px] tracking-wider2 mb-3.5 font-semibold">DIAGNOSIS COMPLETE</div>
          <h1 className="text-[26px] md:text-[48px] leading-[1.28] text-primary font-bold tracking-tight">
            <span className="text-green">{answers.hospitalName ?? "병원"}</span> 원장님,<br />
            진단이 완료되었습니다.
          </h1>
          <p className="mt-6 text-base md:text-lg text-secondary leading-[1.8]">
            입력하신 정보를 기반으로 가장 적합한 패키지를 추천드립니다.
          </p>

          <div className="mt-7 flex flex-wrap gap-2 text-xs">
            {answers.department && <Chip>{answers.department}</Chip>}
            {answers.location && <Chip>{answers.location}</Chip>}
            {answers.stage && <Chip>{answers.stage}</Chip>}
            {answers.budget && <Chip>예산 {answers.budget}</Chip>}
            {answers.timeline && <Chip>진행 {answers.timeline}</Chip>}
          </div>
        </div>

        {/* 추천 패키지 */}
        <div className="mt-22" style={{ marginTop: 88 }}>
          <div className="text-green text-xs tracking-wider2 mb-[22px] font-semibold">RECOMMENDED PACKAGE</div>
          <div className={`grid gap-6 ${rec.packages.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
            {rec.packages.map((p, i) => (
              <PackageRecommendation key={p} pkg={p} reason={rec.reasons[p]} index={i} primary={i === 0} />
            ))}
          </div>
          {rec.note && <p className="mt-5 text-sm text-muted">※ {rec.note}</p>}
        </div>

        {/* 사례 */}
        <div style={{ marginTop: 88 }}>
          <div className="text-green text-xs tracking-wider2 mb-[22px] font-semibold">SIMILAR PROJECTS</div>
          <h3 className="text-[22px] text-primary font-bold tracking-tight mb-6">유사한 결을 가진 병원의 사례</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {CASES.map((c, i) => <CaseStudyCard key={c.name} {...c} delay={0.1 + i * 0.08} />)}
          </div>
        </div>

        {/* 다음 액션 */}
        <div className="mt-18 rounded-[14px] border border-green-line bg-elev p-9 md:p-12" style={{ marginTop: 72 }}>
          <div className="text-green text-xs tracking-wider2 mb-[22px] font-semibold">NEXT STEP</div>
          <h3 className="text-xl md:text-[28px] text-primary font-bold leading-[1.4] tracking-tight">
            24시간 이내, <span className="text-green">정연호</span> 디렉터가 직접 연락드립니다.
          </h3>

          <label className="mt-7 flex items-start gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={optin} onChange={(e) => setOptin(e.target.checked)}
              className="mt-1 h-4 w-4 accent-green" style={{ accentColor: "#0F5254" }} />
            <span className="text-sm text-secondary">
              사전 컨설팅 자료를 이메일({answers.email ?? "입력하신 주소"})로 받아보시겠어요?
            </span>
          </label>

          <div className="mt-9 flex flex-wrap gap-4">
            <button
              onClick={() => alert("실제 배포에서는 카카오톡 SDK로 결과가 전송됩니다.")}
              className="inline-flex items-center gap-3 bg-green text-white px-8 py-[15px] font-semibold rounded transition-all hover:bg-green-2 hover:-translate-y-px shadow-[0_4px_18px_-4px_rgba(15,82,84,0.35)] hover:shadow-[0_8px_28px_-4px_rgba(15,82,84,0.5)]">
              <span>결과를 카카오톡으로 받기</span><span>→</span>
            </button>
            <button
              onClick={() => { reset(); router.push("/"); }}
              className="inline-flex items-center gap-2 border-[1.5px] border-line-soft text-secondary px-8 py-[15px] font-semibold rounded transition-all hover:border-green hover:text-green">
              처음부터 다시
            </button>
          </div>

          <div className="mt-11 pt-6 border-t border-line-soft">
            <Link href="http://photoclinic.kr" target="_blank"
              className="text-[13px] text-muted hover:text-green underline-offset-4 hover:underline font-medium">
              포토클리닉 홈페이지로 돌아가기 →
            </Link>
          </div>
        </div>

        <div className="h-24" />
      </section>
    </main>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-3.5 py-1.5 border border-green-line rounded-full text-green bg-white/60 font-medium">
      {children}
    </span>
  );
}
