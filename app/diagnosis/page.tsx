"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Logo from "@/components/Logo";
import ProgressBar from "@/components/ProgressBar";
import QuestionCard from "@/components/QuestionCard";
import OptionButton from "@/components/OptionButton";
import { useDiagnosis } from "@/lib/store";
import {
  Q1_OPTIONS,
  Q2_OPTIONS,
  Q3_OPTIONS,
  Q4_OPTIONS,
  Q5_OPTIONS,
  Q6_OPTIONS,
  Q7_OPTIONS,
  Q8_OPTIONS,
  TOTAL_STEPS,
} from "@/lib/questions";
import { formatPhone, phoneRegex } from "@/lib/utils";
import type { Concern, Content, Department, Impression, Usage } from "@/types";

const contactSchema = z.object({
  hospitalName: z.string().min(1, "병원명을 입력해주세요"),
  location: z.string().min(1, "병원 위치를 입력해주세요"),
  phone: z.string().regex(phoneRegex, "010-0000-0000 형식으로 입력해주세요"),
  email: z.string().min(1, "이메일을 입력해주세요").email("올바른 이메일을 입력해주세요"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function DiagnosisPage() {
  const router = useRouter();
  const { answers, setAnswers, reset: resetDiagnosis } = useDiagnosis();
  const [step, setStep] = useState(1);


  const next = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const pickAndAdvance = (patch: Partial<typeof answers>) => {
    setAnswers(patch);
    setTimeout(next, 240);
  };

  const toggleConcern = (v: Concern) => {
    const cur = answers.concerns ?? [];
    setAnswers({ concerns: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] });
  };

  const toggleUsage = (v: Usage) => {
    const cur = answers.usages ?? [];
    setAnswers({ usages: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] });
  };

  const toggleImpression = (v: Impression) => {
    const cur = answers.impressions ?? [];
    if (cur.includes(v)) setAnswers({ impressions: cur.filter((x) => x !== v) });
    else setAnswers({ impressions: cur.length >= 2 ? [cur[1], v] : [...cur, v] });
  };

  const toggleContent = (v: Content) => {
    const cur = answers.contents ?? [];
    setAnswers({ contents: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset: resetForm,
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      hospitalName: answers.hospitalName ?? "",
      location: answers.location ?? "",
      phone: answers.phone ?? "",
      email: answers.email ?? "",
    },
  });

  useEffect(() => {
    document.body.classList.remove("phase-result");

    try {
      window.localStorage.removeItem("photoclinic-diagnosis");
    } catch {}

    resetDiagnosis();
    resetForm({
      hospitalName: "",
      location: "",
      phone: "",
      email: "",
    });
    setStep(1);
  }, [resetDiagnosis, resetForm]);

  const phoneVal = watch("phone");
  useEffect(() => {
    if (phoneVal !== undefined) setValue("phone", formatPhone(phoneVal));
  }, [phoneVal, setValue]);

  const onSubmitContact = async (data: ContactForm) => {
    const normalized = { ...data, email: data.email };
    setAnswers(normalized);
    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...answers, ...normalized }),
      });
    } catch {}
    router.push("/result");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="relative min-h-screen bg-base">
      <ProgressBar step={step} total={TOTAL_STEPS} />

      <header className="px-9 pt-7 flex items-center justify-between">
        <Logo />
        <div className="text-[13px] tracking-wider2 text-muted font-medium">
          <span className="text-orange font-bold">{String(step).padStart(2, "0")}</span> / {String(TOTAL_STEPS).padStart(2, "0")}
        </div>
      </header>

      <section className="px-9 pt-16 pb-44 max-w-[760px] mx-auto">
        <AnimatePresence mode="wait">
          <div key={step} className="w-full">
            {step === 1 && (
              <QuestionCard qNumber="Q1" title="지금 병원은 어떤 단계인가요?">
                <div className="grid gap-3">
                  {Q1_OPTIONS.map((opt, i) => (
                    <OptionButton
                      key={opt.value}
                      index={i}
                      label={opt.label}
                      sub={opt.sub}
                      selected={answers.stage === opt.value}
                      onClick={() => pickAndAdvance({ stage: opt.value })}
                    />
                  ))}
                </div>
              </QuestionCard>
            )}

            {step === 2 && (
              <QuestionCard qNumber="Q2" title="현재 가장 고민되는 부분은 무엇인가요?" hint="복수 선택이 가능합니다.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Q2_OPTIONS.map((opt, i) => (
                    <OptionButton
                      key={opt.value}
                      index={i}
                      label={opt.label}
                      multi
                      selected={answers.concerns?.includes(opt.value) ?? false}
                      onClick={() => toggleConcern(opt.value)}
                    />
                  ))}
                </div>
              </QuestionCard>
            )}

            {step === 3 && (
              <QuestionCard qNumber="Q3" title="병원 진료과는 무엇인가요?">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Q3_OPTIONS.map((opt, i) => (
                    <OptionButton
                      key={opt}
                      index={i}
                      label={opt}
                      selected={answers.department === opt}
                      onClick={() => pickAndAdvance({ department: opt as Department })}
                    />
                  ))}
                </div>
              </QuestionCard>
            )}

            {step === 4 && (
              <QuestionCard qNumber="Q4" title="사진이 주로 사용될 곳은 어디인가요?" hint="홈페이지, 플레이스, SNS처럼 실제 사용처를 기준으로 선택해주세요.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Q4_OPTIONS.map((opt, i) => (
                    <OptionButton
                      key={opt.value}
                      index={i}
                      label={opt.label}
                      multi
                      selected={answers.usages?.includes(opt.value) ?? false}
                      onClick={() => toggleUsage(opt.value)}
                    />
                  ))}
                </div>
              </QuestionCard>
            )}

            {step === 5 && (
              <QuestionCard qNumber="Q5" title="우리 병원의 가장 중요한 이미지는 무엇인가요?" hint="최대 2개까지 선택할 수 있어요.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Q5_OPTIONS.map((opt, i) => (
                    <OptionButton
                      key={opt}
                      index={i}
                      label={opt}
                      multi
                      selected={answers.impressions?.includes(opt as Impression) ?? false}
                      onClick={() => toggleImpression(opt as Impression)}
                    />
                  ))}
                </div>
              </QuestionCard>
            )}

            {step === 6 && (
              <QuestionCard qNumber="Q6" title="꼭 필요한 촬영/제작 항목은 무엇인가요?" hint="최소 1개 이상 선택해주세요.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Q6_OPTIONS.map((opt, i) => (
                    <OptionButton
                      key={opt}
                      index={i}
                      label={opt}
                      multi
                      selected={answers.contents?.includes(opt as Content) ?? false}
                      onClick={() => toggleContent(opt as Content)}
                    />
                  ))}
                </div>
              </QuestionCard>
            )}

            {step === 7 && (
              <QuestionCard qNumber="Q7" title="예산 범위는 어느 정도 생각하고 계신가요?">
                <div className="grid gap-3">
                  {Q7_OPTIONS.map((opt, i) => (
                    <OptionButton
                      key={opt.value}
                      index={i}
                      label={opt.label}
                      selected={answers.budget === opt.value}
                      onClick={() => pickAndAdvance({ budget: opt.value })}
                    />
                  ))}
                </div>
              </QuestionCard>
            )}

            {step === 8 && (
              <QuestionCard qNumber="Q8" title="진행 시점은 언제쯤 생각하세요?">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Q8_OPTIONS.map((opt, i) => (
                    <OptionButton
                      key={opt.value}
                      index={i}
                      label={opt.label}
                      selected={answers.timeline === opt.value}
                      onClick={() => pickAndAdvance({ timeline: opt.value })}
                    />
                  ))}
                </div>
              </QuestionCard>
            )}

            {step === 9 && (
              <QuestionCard
                qNumber="Q9"
                title="상담과 자료 전송을 위한 병원 정보를 남겨주세요."
                hint="진단 완료 후 이 정보가 상담 DB에 저장되고, 이메일로 요약 자료를 받을 수 있습니다."
              >
                <form onSubmit={handleSubmit(onSubmitContact)} className="space-y-8">
                  <Field label="병원명" error={errors.hospitalName?.message}>
                    <input {...register("hospitalName")} placeholder="예) 포토클리닉의원" className="field" />
                  </Field>
                  <Field label="병원 위치" error={errors.location?.message}>
                    <input {...register("location")} placeholder="예) 서울 강남구 압구정동" className="field" />
                  </Field>
                  <Field label="연락처" error={errors.phone?.message}>
                    <input {...register("phone")} placeholder="010-0000-0000" inputMode="numeric" className="field" />
                  </Field>
                  <Field label="이메일" error={errors.email?.message}>
                    <input {...register("email")} placeholder="photoclinic@gmail.com" type="email" className="field" />
                  </Field>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-3 bg-orange text-white px-[38px] py-[18px] text-base font-semibold rounded transition-all hover:bg-orange-2 hover:-translate-y-px shadow-[0_4px_18px_-4px_rgba(230,98,42,0.35)] hover:shadow-[0_8px_28px_-4px_rgba(230,98,42,0.5)]"
                    style={{ marginTop: 16 }}
                  >
                    <span>진단 결과 확인하고 상담 접수하기</span>
                    <span>→</span>
                  </button>
                  <p className="text-[13px] text-muted">
                    ← <button type="button" onClick={prev} className="underline underline-offset-2 hover:text-primary">이전 단계로</button>
                  </p>
                </form>
              </QuestionCard>
            )}
          </div>
        </AnimatePresence>
      </section>

      {step !== TOTAL_STEPS && (
        <nav className="fixed bottom-0 inset-x-0 bg-base/90 backdrop-blur border-t border-line-soft z-30">
          <div className="max-w-[760px] mx-auto px-9 py-[18px] flex items-center justify-between">
            <button onClick={prev} disabled={step === 1} className="text-sm text-muted hover:text-primary disabled:opacity-30 transition-colors font-medium">
              ← 이전
            </button>
            {(step === 2 || step === 4 || step === 5 || step === 6) && (
              <button
                onClick={next}
                disabled={
                  (step === 2 && (answers.concerns?.length ?? 0) < 1) ||
                  (step === 4 && (answers.usages?.length ?? 0) < 1) ||
                  (step === 5 && (answers.impressions?.length ?? 0) < 1) ||
                  (step === 6 && (answers.contents?.length ?? 0) < 1)
                }
                className="inline-flex items-center gap-2 px-6 py-[11px] border-[1.5px] border-orange text-orange font-semibold rounded transition-all hover:bg-orange hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-orange"
              >
                다음 →
              </button>
            )}
          </div>
        </nav>
      )}

      <style jsx>{`
        .field {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 2px solid rgba(15,82,84,0.14);
          padding: 12px 0;
          font-size: 18px;
          color: #1A1A1A;
          font-weight: 500;
          outline: none;
          transition: border-color 0.2s;
        }
        .field:focus { border-color: #E6622A; }
        .field::placeholder { color: rgba(107,117,114,0.45); }
      `}</style>
    </main>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs tracking-wider2 text-orange font-semibold">{label}</label>
      {children}
      {error && <p className="mt-2 text-xs text-[#c62828] font-medium">{error}</p>}
    </div>
  );
}
