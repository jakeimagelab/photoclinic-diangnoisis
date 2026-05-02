import type { Answers, Package } from "@/types";

export interface Recommendation {
  packages: Package[];
  reasons: Partial<Record<Package, string>>;
  note?: string;
}

const PACKAGE_INFO: Record<Package, { ko: string; items: string[] }> = {
  Premium: {
    ko: "프리미엄",
    items: ["의료진 프로필 촬영", "진료 연출 기획 및 촬영", "병원 분위기 / 인테리어 촬영"],
  },
  "Premium Plus": {
    ko: "프리미엄 플러스",
    items: ["Premium 패키지 전 항목", "브랜드 영상 4K · 1분 30초", "스토리 영상 4K · 30초"],
  },
  Homepage: {
    ko: "홈페이지",
    items: ["Premium 패키지 전 항목", "병원 홈페이지 기획 및 제작"],
  },
  "Branding Content": {
    ko: "브랜딩 콘텐츠",
    items: ["언론 홍보", "굿닥터 100인 기획", "방송 출연 기획"],
  },
};

export function packageInfo(p: Package) {
  return PACKAGE_INFO[p];
}

export function recommend(a: Answers): Recommendation {
  const candidates: Package[] = [];
  const reasons: Partial<Record<Package, string>> = {};

  const has = (c: string) => a.contents?.includes(c as any);
  const isHighBudget = a.budget === "300-500" || a.budget === "500이상";

  if ((has("브랜드 영상") && isHighBudget) ||
      (a.stage === "신규개원" && (a.contents?.length ?? 0) >= 3)) {
    candidates.push("Premium Plus");
    reasons["Premium Plus"] =
      a.stage === "신규개원"
        ? "신규 개원 단계에서 다양한 콘텐츠가 함께 필요하므로, 영상까지 포함된 Premium Plus가 가장 적합합니다."
        : "브랜드 영상이 포함되어 있고 예산 여유가 있어, 사진과 영상을 함께 진행하는 Premium Plus를 추천드립니다.";
  }
  if (has("홈페이지 제작")) {
    candidates.push("Homepage");
    reasons["Homepage"] =
      "홈페이지 제작이 필요하시므로, 촬영과 홈페이지를 한 번에 정돈할 수 있는 Homepage 패키지가 적합합니다.";
  }
  if (has("언론 홍보")) {
    candidates.push("Branding Content");
    reasons["Branding Content"] =
      "언론 홍보가 필요하시므로, 미디어 노출까지 함께 설계하는 Branding Content를 추천드립니다.";
  }
  const onlyPhotoContents =
    (a.contents?.length ?? 0) > 0 &&
    a.contents!.every((c) =>
      ["의료진 프로필", "인테리어·공간 사진", "진료 연출 컷"].includes(c)
    );
  if (onlyPhotoContents || a.stage === "촬영만") {
    candidates.push("Premium");
    reasons["Premium"] =
      a.stage === "촬영만"
        ? "촬영만 필요하신 단계이므로, 핵심 촬영 항목으로 구성된 Premium이 가장 잘 맞습니다."
        : "선택하신 항목이 핵심 촬영에 집중되어 있어, Premium 패키지로 충분히 커버 가능합니다.";
  }

  const priority: Package[] = ["Premium Plus", "Homepage", "Branding Content", "Premium"];
  const seen = new Set<Package>();
  const sorted = priority.filter(
    (p) => candidates.includes(p) && !seen.has(p) && (seen.add(p), true)
  );

  let final = sorted.slice(0, 2);
  if (final.length === 0) {
    final = ["Premium"];
    reasons["Premium"] =
      "기본 촬영부터 시작하시는 것을 추천드립니다. Premium 패키지가 가장 합리적인 출발점입니다.";
  }

  const note =
    a.budget === "추천받기"
      ? "예산을 아직 정하지 않으셨다면, Premium 패키지부터 시작하시는 것을 추천드립니다."
      : undefined;

  return { packages: final, reasons, note };
}
