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
import type { Concern, Content, Department, Impression, PhotoCategory, UploadedPhoto, Usage } from "@/types";

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
  const [photoFiles, setPhotoFiles] = useState<Record<PhotoCategory, File[]>>({
    "원장님 프로필사진": [],
    "병원 공간사진": [],
    "진료·상담 장면사진": [],
  });
  const [photoUploadConsent, setPhotoUploadConsent] = useState(false);
  const [photoMemo, setPhotoMemo] = useState("");

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
    setPhotoFiles({
      "원장님 프로필사진": [],
      "병원 공간사진": [],
      "진료·상담 장면사진": [],
    });
    setPhotoUploadConsent(false);
    setPhotoMemo("");
    setStep(1);
  }, [resetDiagnosis, resetForm]);

  const phoneVal = watch("phone");
  useEffect(() => {
    if (phoneVal !== undefined) setValue("phone", formatPhone(phoneVal));
  }, [phoneVal, setValue]);

  const onSubmitContact = async (data: ContactForm) => {
    const normalized = { ...data, email: data.email };
    setAnswers(normalized);
    setTimeout(next, 240);
  };

  const handlePhotoChange = (category: PhotoCategory, files: FileList | null) => {
    setPhotoFiles((prev) => ({
      ...prev,
      [category]: Array.from(files ?? []).slice(0, category === "원장님 프로필사진" ? 1 : 3),
    }));
  };

  const uploadedPhotos: UploadedPhoto[] = Object.entries(photoFiles).flatMap(([category, files]) =>
    files.map((file) => ({
      category: category as PhotoCategory,
      name: file.name,
      size: file.size,
      type: file.type,
    }))
  );

  const submitDiagnosis = async () => {
    const photoPatch = {
      uploadedPhotos,
      photoUploadConsent,
      photoMemo: photoMemo.trim(),
    };

    setAnswers(photoPatch);

    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...answers, ...photoPatch }),
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
                hint="다음 단계에서 현재 사용 중인 원장님 사진이나 병원사진을 업로드할 수 있습니다."
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
                    <span>다음: 사진 업로드</span>
                    <span>→</span>
                  </button>
                  <p className="text-[13px] text-muted">
                    ← <button type="button" onClick={prev} className="underline underline-offset-2 hover:text-primary">이전 단계로</button>
                  </p>
                </form>
              </QuestionCard>
            )}

            {step === 10 && (
              <QuestionCard
                qNumber="Q10"
                title="현재 사용 중인 원장님 사진 또는 병원사진을 업로드해주세요."
                hint="업로드 자료를 바탕으로 병원 이미지 관점의 장점과 보완점을 더 구체적으로 확인할 수 있습니다."
              >
                <div className="space-y-7">
                  <UploadField
                    title="원장님 프로필사진"
                    description="현재 홈페이지나 플레이스에서 사용 중인 대표 프로필사진 1장을 올려주세요."
                    files={photoFiles["원장님 프로필사진"]}
                    maxText="최대 1장"
                    onChange={(files) => handlePhotoChange("원장님 프로필사진", files)}
                  />

                  <UploadField
                    title="병원 공간사진"
                    description="로비, 진료실, 상담실, 인테리어 등 병원의 분위기가 보이는 사진을 올려주세요."
                    files={photoFiles["병원 공간사진"]}
                    maxText="최대 3장"
                    multiple
                    onChange={(files) => handlePhotoChange("병원 공간사진", files)}
                  />

                  <UploadField
                    title="진료·상담 장면사진"
                    description="상담, 진료, 검사, 치료 등 실제 진료 흐름을 보여주는 사진이 있다면 올려주세요."
                    files={photoFiles["진료·상담 장면사진"]}
                    maxText="최대 3장"
                    multiple
                    onChange={(files) => handlePhotoChange("진료·상담 장면사진", files)}
                  />

                  <div className="rounded-[14px] border border-line-soft bg-white/60 p-5">
                    <label className="text-xs tracking-wider2 text-orange font-semibold">추가 요청사항</label>
                    <textarea
                      value={photoMemo}
                      onChange={(e) => setPhotoMemo(e.target.value)}
                      placeholder="예) 원장님 프로필이 너무 딱딱해 보여요. 병원 분위기를 더 따뜻하게 보이고 싶습니다."
                      className="mt-3 min-h-[110px] w-full resize-none rounded-[10px] border border-line-soft bg-white/80 p-4 text-[15px] leading-[1.7] text-primary outline-none transition focus:border-orange"
                    />
                  </div>

                  <label className="flex cursor-pointer select-none items-start gap-3 rounded-[14px] border border-green-line bg-elev p-5">
                    <input
                      type="checkbox"
                      checked={photoUploadConsent}
                      onChange={(e) => setPhotoUploadConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 accent-green"
                      style={{ accentColor: "#0F5254" }}
                    />
                    <span className="text-sm leading-[1.75] text-secondary">
                      업로드한 사진은 병원이미지 진단 및 상담 리포트 작성 목적으로만 사용됩니다.
                      사진에 포함된 인물의 업로드 및 상담 활용에 대한 동의를 받았음을 확인합니다.
                    </span>
                  </label>

                  <div className="rounded-[14px] border border-orange/20 bg-white/70 p-5 text-sm leading-[1.75] text-secondary">
                    현재 버전은 사진 파일의 <strong>업로드 여부와 파일명</strong>을 상담 DB에 함께 남기는 구조입니다.
                    실제 이미지 파일 저장은 Google Drive 또는 Supabase Storage 연결 후 활성화할 수 있습니다.
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={submitDiagnosis}
                      disabled={uploadedPhotos.length > 0 && !photoUploadConsent}
                      className="inline-flex items-center gap-3 bg-orange text-white px-[38px] py-[18px] text-base font-semibold rounded transition-all hover:bg-orange-2 hover:-translate-y-px shadow-[0_4px_18px_-4px_rgba(230,98,42,0.35)] hover:shadow-[0_8px_28px_-4px_rgba(230,98,42,0.5)] disabled:opacity-40 disabled:hover:translate-y-0"
                    >
                      <span>{uploadedPhotos.length > 0 ? "사진과 함께 진단 결과 확인" : "사진 없이 진단 결과 확인"}</span>
                      <span>→</span>
                    </button>
                    <button
                      type="button"
                      onClick={prev}
                      className="text-sm text-muted underline underline-offset-2 hover:text-primary"
                    >
                      이전 단계로
                    </button>
                  </div>
                </div>
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

function UploadField({
  title,
  description,
  files,
  maxText,
  multiple = false,
  onChange,
}: {
  title: PhotoCategory;
  description: string;
  files: File[];
  maxText: string;
  multiple?: boolean;
  onChange: (files: FileList | null) => void;
}) {
  return (
    <div className="rounded-[14px] border border-line-soft bg-white/70 p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs tracking-wider2 text-orange font-semibold">{title}</div>
          <p className="mt-2 text-sm leading-[1.7] text-secondary">{description}</p>
        </div>
        <span className="shrink-0 rounded-full border border-green-line bg-elev px-3 py-1 text-xs font-medium text-green">
          {maxText}
        </span>
      </div>

      <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-green-line bg-elev/70 px-5 py-8 text-center transition hover:border-orange hover:bg-white">
        <span className="text-[15px] font-semibold text-primary">사진 선택하기</span>
        <span className="mt-2 text-xs leading-[1.6] text-muted">JPG, PNG, HEIC 등 이미지 파일을 선택해주세요.</span>
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => onChange(e.target.files)}
        />
      </label>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file) => (
            <li key={`${title}-${file.name}-${file.size}`} className="flex items-center justify-between gap-3 rounded-[10px] bg-white px-4 py-3 text-sm text-secondary">
              <span className="truncate">{file.name}</span>
              <span className="shrink-0 text-xs text-muted">{Math.max(1, Math.round(file.size / 1024))}KB</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
