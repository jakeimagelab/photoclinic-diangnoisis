"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Answers } from "@/types";

interface State {
  answers: Answers;
  setAnswers: (patch: Partial<Answers>) => void;
  reset: () => void;
}

const initial: Answers = {
  concerns: [],
  usages: [],
  impressions: [],
  contents: [],
  consultationOptin: true,
  uploadedPhotos: [],
  photoUploadConsent: false,
  photoMemo: "",
};

export const useDiagnosis = create<State>()(
  persist(
    (set) => ({
      answers: initial,
      setAnswers: (patch) => set((s) => ({ answers: { ...s.answers, ...patch } })),
      reset: () => set({ answers: initial }),
    }),
    { name: "photoclinic-diagnosis" }
  )
);
