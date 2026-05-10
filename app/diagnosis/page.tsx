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
import type {
  Concern,
  Content,
  Department,
  Impression,
  Usage,
} from "@/types";

const contactSchema = z.object({
  hospitalName: z.string().min(1, "병원명을 입력해주세요"),
  contactRole: z.string().min(1, "문의자 유형을 선택해주세요"),
  location: z.string().min(1, "병원 위치를 입력해주세요"),
  phone: z.string().regex(phoneRegex, "010-0000-0000 형식으로 입력해주세요"),
  email: z
    .string()
    .min(1, "이메일을 입력해주세요")
    .email("올바른 이메일을 입력해주세요"),
});

type ContactForm = z.infer<typeof contactSchema>;

type UploadedPhotoMeta = {
  category: string;
  name: string;
  size: number;
  type: string;
};

const CONTACT_ROLE_OPTIONS = [
  "원장님",
  "실장님",
  "마케팅 담당자",
  "대행사/협력업체",
  "기타",
] as const;

const PHOTO_UPLOAD_OPTIONS = [
  {
    category: "원장님 프로필사진",
    title: "원장님 프로필사진",
    desc: "현재 홈페이지, 네이버 플레이스, 소개 페이지에서 사용 중인 원장님 사진을 올려주세요.",
    accept: "image/*",
  },
  {
    category: "병원 공간사진",
    title: "병원 공간사진",
    desc: "로비, 상담실, 진료실, 시술실 등 병원의 분위기가 보이는 사진을 올려주세요.",
    accept: "image/*",
  },
  {
    category: "진료·상담 장면사진",
    title: "진료·상담 장면사진",
    desc: "상담, 설명, 진료, 시술 연출 등 환자에게 신뢰를 줄 수 있는 장면 사진을 올려주세요.",
    accept: "image/*",
  },
] as const;

export default function DiagnosisPage() {
  const router = useRouter();
  const { answers, setAnswers, reset: resetDiagnosis } = useDiagnosis();

  const [step, setStep] = useState(1);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhotoMeta[]>(
    answers.uploadedPhotos ?? []
  );
  const [photoUploadConsent, setPhotoUploadConsent] = useState(
    answers.photoUploadConsent ?? false
  );
  const [photoMemo, setPhotoMemo] = useState(answers.photoMemo ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const next = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const pickAndAdvance = (patch: Partial<typeof answers>) => {
    setAnswers(patch);
    setTimeout(next, 240);
  };

  const toggleConcern = (v: Concern) => {
    const cur = answers.concerns ?? [];
    setAnswers({
      concerns: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v],
    });
  };

  const toggleUsage = (v: Usage) => {
    const cur = answers.usages ?? [];
    setAnswers({
      usages: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v],
    });
  };

  const toggleImpression = (v: Impression) => {
    const cur = answers.impressions ?? [];

    if (cur.includes(v)) {
      setAnswers({ impressions: cur.filter((x) => x !== v) });
    } else {
      setAnswers({ impressions: cur.length >= 2 ? [cur[1], v] : [...cur, v] });
    }
  };

  const toggleContent = (v: Content) => {
    const cur = answers.contents ?? [];
    setAnswers({
      contents: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v],
    });
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
      contactRole: answers.contactRole ?? "",
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
      contactRole: "",
      location: "",
      phone: "",
      email: "",
    });

    setUploadedPhotos([]);
    setPhotoUploadConsent(false);
    setPhotoMemo("");
    setStep(1);
  }, [resetDiagnosis, resetForm]);

  const phoneVal = watch("phone");
  const selectedContactRole = watch("contactRole");

  useEffect(() => {
    if (phoneVal !== undefined) {
      setValue("phone", formatPhone(phoneVal));
    }
  }, [phoneVal, setValue]);

  const onSubmitContact = (data: ContactForm) => {
    setAnswers({ ...data, email: data.email });
    next();
  };

  const handlePhotoChange = (category: string, files: FileList | null) => {
    const selectedFiles = Array.from(files ?? []);

    setUploadedPhotos((prev) => {
      const filtered = prev.filter((photo) => photo.category !== category);

      const nextPhotos = selectedFiles.map((file) => ({
        category,
        name: file.name,
        size: file.size,
        type: file.type,
      }));

      return [...filtered, ...nextPhotos];
    });
  };

  const removePhotosByCategory = (category: string) => {
    setUploadedPhotos((prev) =>
      prev.filter((photo) => photo.category !== category)
    );
  };

  const submitFinalDiagnosis = async () => {
    if (uploadedPhotos.length > 0 && !photoUploadConsent) {
      alert("사진을 업로드한 경우 사진 활용 동의가 필요합니다.");
      return;
    }

    const finalAnswers = {
      ...answers,
      uploadedPhotos,
      photoUploadConsent,
      photoMemo,
    };

    setAnswers({
      uploadedPhotos,
      photoUploadConsent,
      photoMemo,
    });

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalAnswers),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.ok === false) {
        alert(
          `상담 DB 저장에 실패했습니다.\n\n${
            result.error || "원인을 확인할 수 없습니다."
          }`
        );
        return;
      }

      router.push("/result");
    } catch (error: any) {
      alert(`상담 DB 저장 중 오류가 발생했습니다.\n\n${error?.message || ""}`);
    } finally {
      setIsSubmitting(false);
    }
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
          <span className="text-orange font-bold">
            {String(step).padStart(2, "0")}
          </span>{" "}
          / {String(TOTAL_STEPS).padStart(2, "0")}
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
              <QuestionCard
                qNumber="Q2"
                title="현재 가장 고민되는 부분은 무엇인가요?"
                hint="복수 선택이 가능합니다."
              >
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
                      onClick={() =>
                        pickAndAdvance({ department: opt as Department })
                      }
                    />
                  ))}
                </div>
              </QuestionCard>
            )}

            {step === 4 && (
              <QuestionCard
                qNumber="Q4"
                title="사진이 주로 사용될 곳은 어디인가요?"
                hint="홈페이지, 플레이스, SNS처럼 실제 사용처를 기준으로 선택해주세요."
              >
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
              <QuestionCard
                qNumber="Q5"
                title="우리 병원의 가장 중요한 이미지는 무엇인가요?"
                hint="최대 2개까지 선택할 수 있어요."
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Q5_OPTIONS.map((opt, i) => (
                    <OptionButton
                      key={opt}
                      index={i}
                      label={opt}
                      multi
                      selected={
                        answers.impressions?.includes(opt as Impression) ??
                        false
                      }
                      onClick={() => toggleImpression(opt as Impression)}
                    />
                  ))}
                </div>
              </QuestionCard>
            )}

            {step === 6 && (
              <QuestionCard
                qNumber="Q6"
                title="꼭 필요한 촬영/제작 항목은 무엇인가요?"
                hint="최소 1개 이상 선택해주세요."
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Q6_OPTIONS.map((opt, i) => (
                    <OptionButton
                      key={opt}
                      index={i}
                      label={opt}
                      multi
                      selected={
                        answers.contents?.includes(opt as Content) ?? false
                      }
                      onClick={() => toggleContent(opt as Content)}
                    />
                  ))}
                </div>
              </QuestionCard>
            )}

            {step === 7 && (
              <QuestionCard
                qNumber="Q7"
                title="예산 범위는 어느 정도 생각하고 계신가요?"
              >
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
                <form
                  onSubmit={handleSubmit(onSubmitContact)}
                  className="space-y-8"
                >
                  <Field label="병원명" error={errors.hospitalName?.message}>
                    <input
                      {...register("hospitalName")}
                      placeholder="예) 포토클리닉의원"
                      className="field"
                    />
                  </Field>

                  <Field label="문의자 유형" error={errors.contactRole?.message}>
                    <input type="hidden" {...register("contactRole")} />

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {CONTACT_ROLE_OPTIONS.map((role) => {
                        const selected = selectedContactRole === role;

                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => {
                              setValue("contactRole", role, {
                                shouldValidate: true,
                                shouldDirty: true,
                                shouldTouch: true,
                              });
                            }}
                            className={`min-h-[58px] rounded-2xl border px-5 py-4 text-left text-[15px] font-semibold transition-all ${
                              selected
                                ? "border-orange bg-orange text-white shadow-[0_8px_24px_-10px_rgba(230,98,42,0.65)]"
                                : "border-[#155855]/15 bg-white/70 text-[#155855] hover:border-orange/50 hover:bg-white"
                            }`}
                          >
                            {role}
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  <Field label="병원 위치" error={errors.location?.message}>
                    <input
                      {...register("location")}
                      placeholder="예) 서울 강남구 압구정동"
                      className="field"
                    />
                  </Field>

                  <Field label="연락처" error={errors.phone?.message}>
                    <input
                      {...register("phone")}
                      placeholder="010-0000-0000"
                      inputMode="numeric"
                      className="field"
                    />
                  </Field>

                  <Field label="이메일" error={errors.email?.message}>
                    <input
                      {...register("email")}
                      placeholder="photoclinic@gmail.com"
                      type="email"
                      className="field"
                    />
                  </Field>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-3 bg-orange text-white px-[38px] py-[18px] text-base font-semibold rounded transition-all hover:bg-orange-2 hover:-translate-y-px shadow-[0_4px_18px_-4px_rgba(230,98,42,0.35)] hover:shadow-[0_8px_28px_-4px_rgba(230,98,42,0.5)]"
                    style={{ marginTop: 16 }}
                  >
                    <span>사진 업로드 단계로 이동하기</span>
                    <span>→</span>
                  </button>

                  <p className="text-[13px] text-muted">
                    ←{" "}
                    <button
                      type="button"
                      onClick={prev}
                      className="underline underline-offset-2 hover:text-primary"
                    >
                      이전 단계로
                    </button>
                  </p>
                </form>
              </QuestionCard>
            )}

            {step === 10 && (
              <QuestionCard
                qNumber="Q10"
                title="현재 사용 중인 병원사진을 업로드해주세요."
                hint="사진 업로드는 선택사항입니다. 업로드해주시면 병원이미지 진단과 상담 리포트에 더 구체적으로 반영할 수 있습니다."
              >
                <div className="space-y-7">
                  <div className="rounded-[28px] border border-[#155855]/10 bg-white/70 p-6">
                    <p className="text-[15px] leading-7 text-muted">
                      원장님 프로필사진, 병원 공간사진, 진료·상담 장면사진을
                      올려주시면 포토클리닉이 사진의 장점과 보완점을 더
                      구체적으로 확인할 수 있습니다.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {PHOTO_UPLOAD_OPTIONS.map((item) => {
                      const filesForCategory = uploadedPhotos.filter(
                        (photo) => photo.category === item.category
                      );

                      return (
                        <div
                          key={item.category}
                          className="rounded-[28px] border border-[#155855]/12 bg-white/80 p-6 shadow-[0_14px_38px_-30px_rgba(15,82,84,0.55)]"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-primary">
                                {item.title}
                              </h3>
                              <p className="mt-2 text-sm leading-6 text-muted">
                                {item.desc}
                              </p>
                            </div>

                            <label className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-orange px-5 py-3 text-sm font-semibold text-orange transition hover:bg-orange hover:text-white">
                              파일 선택
                              <input
                                type="file"
                                accept={item.accept}
                                multiple
                                className="hidden"
                                onChange={(event) =>
                                  handlePhotoChange(
                                    item.category,
                                    event.target.files
                                  )
                                }
                              />
                            </label>
                          </div>

                          {filesForCategory.length > 0 && (
                            <div className="mt-5 rounded-2xl bg-[#F7FBFA] p-4">
                              <div className="mb-3 flex items-center justify-between">
                                <p className="text-xs font-semibold tracking-wider2 text-orange">
                                  선택된 파일
                                </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removePhotosByCategory(item.category)
                                  }
                                  className="text-xs font-semibold text-muted underline underline-offset-2 hover:text-primary"
                                >
                                  삭제
                                </button>
                              </div>

                              <ul className="space-y-2">
                                {filesForCategory.map((photo, index) => (
                                  <li
                                    key={`${photo.category}-${photo.name}-${index}`}
                                    className="text-sm text-[#155855]"
                                  >
                                    {photo.name}{" "}
                                    <span className="text-muted">
                                      ({Math.round(photo.size / 1024)}KB)
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-[28px] border border-[#155855]/12 bg-white/80 p-6">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={photoUploadConsent}
                        onChange={(event) =>
                          setPhotoUploadConsent(event.target.checked)
                        }
                        className="mt-1 h-4 w-4 accent-[#E85D2C]"
                      />
                      <span className="text-sm leading-6 text-muted">
                        업로드한 사진은 병원이미지 진단 및 상담 리포트 작성
                        목적으로만 사용됩니다. 사진에 포함된 인물의 업로드 및
                        상담 활용에 대한 동의를 받았음을 확인합니다.
                      </span>
                    </label>

                    <p className="mt-4 text-xs leading-5 text-muted">
                      환자 얼굴이 포함된 사진은 업로드 전 모자이크 처리하거나,
                      초상권 및 개인정보 활용 동의가 완료된 사진만 업로드해주세요.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs tracking-wider2 text-orange font-semibold">
                      사진 관련 추가 요청
                    </label>
                    <textarea
                      value={photoMemo}
                      onChange={(event) => setPhotoMemo(event.target.value)}
                      placeholder="예) 현재 홈페이지에 사용 중인 사진입니다. 원장님 인상이 더 부드러워 보였으면 좋겠습니다."
                      className="mt-3 min-h-[120px] w-full resize-none rounded-[24px] border border-[#155855]/12 bg-white/80 p-5 text-[15px] leading-7 text-[#1A1A1A] outline-none transition focus:border-orange"
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={submitFinalDiagnosis}
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-3 bg-orange text-white px-[38px] py-[18px] text-base font-semibold rounded transition-all hover:bg-orange-2 hover:-translate-y-px disabled:opacity-50 shadow-[0_4px_18px_-4px_rgba(230,98,42,0.35)] hover:shadow-[0_8px_28px_-4px_rgba(230,98,42,0.5)]"
                    >
                      <span>
                        {isSubmitting
                          ? "저장 중..."
                          : "진단 결과 확인하고 상담 접수하기"}
                      </span>
                      {!isSubmitting && <span>→</span>}
                    </button>

                    <button
                      type="button"
                      onClick={prev}
                      className="inline-flex items-center justify-center px-6 py-[18px] text-sm font-semibold text-muted underline underline-offset-2 hover:text-primary"
                    >
                      ← 이전 단계로
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
            <button
              onClick={prev}
              disabled={step === 1}
              className="text-sm text-muted hover:text-primary disabled:opacity-30 transition-colors font-medium"
            >
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
          border-bottom: 2px solid rgba(15, 82, 84, 0.14);
          padding: 12px 0;
          font-size: 18px;
          color: #1a1a1a;
          font-weight: 500;
          outline: none;
          transition: border-color 0.2s;
          border-radius: 0;
        }

        .field:focus {
          border-color: #e6622a;
        }

        .field::placeholder {
          color: rgba(107, 117, 114, 0.45);
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs tracking-wider2 text-orange font-semibold">
        {label}
      </label>
      {children}
      {error && <p className="mt-2 text-xs text-[#c62828] font-medium">{error}</p>}
    </div>
  );
}
