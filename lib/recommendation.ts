import type { Answers, DiagnosisType, Package } from "@/types";

export interface Recommendation {
  diagnosisType: DiagnosisType;
  headline: string;
  summary: string;
  risks: string[];
  neededShots: string[];
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
    items: ["Premium 패키지 전 항목", "병원 홈페이지 기획 및 제작", "검색/전환을 고려한 화면 구성"],
  },
  "Branding Content": {
    ko: "브랜딩 콘텐츠",
    items: ["블로그·SNS 콘텐츠", "언론 홍보", "AI 검색 대응용 이미지·텍스트 구조"],
  },
};

export function packageInfo(p: Package) {
  return PACKAGE_INFO[p];
}

const has = (arr: readonly string[] | undefined, value: string) => arr?.includes(value) ?? false;

function decideType(a: Answers): DiagnosisType {
  if (a.stage === "개원예정" || a.stage === "신규오픈" || has(a.contents, "홈페이지 제작")) return "개원 브랜딩형";
  if (has(a.concerns, "의료진신뢰") || has(a.concerns, "전문성부족")) return "신뢰 보완형";
  if (has(a.concerns, "공간매력부족") || has(a.contents, "인테리어·분위기")) return "공간 이미지 강화형";
  if (has(a.contents, "진료연출") || has(a.contents, "장비·시술 장면") || has(a.contents, "환자 모델 연출")) return "진료 장면 설계형";
  return "콘텐츠 확장형";
}

const COPY: Record<DiagnosisType, { headline: string; summary: string; risks: string[]; neededShots: string[] }> = {
  "개원 브랜딩형": {
    headline: "개원 초기부터 병원의 첫인상을 설계해야 하는 상태입니다.",
    summary: "홈페이지, 플레이스, 블로그, 광고에 같은 톤으로 사용할 수 있는 기본 이미지 세트가 중요합니다. 단순히 예쁜 사진보다 병원의 방향성과 진료 철학이 한 번에 전달되어야 합니다.",
    risks: ["초기 사진 톤이 흔들리면 이후 홈페이지·플레이스·SNS 이미지가 계속 어긋날 수 있습니다.", "개원 직후에는 촬영 재정비 시간이 부족해 첫 세팅의 완성도가 중요합니다."],
    neededShots: ["원장님/의료진 프로필", "공간 메인 비주얼", "상담·진료 연출", "장비 실사용 컷", "홈페이지 섹션별 이미지"],
  },
  "신뢰 보완형": {
    headline: "의료진의 전문성과 따뜻함을 더 선명하게 보여줘야 하는 상태입니다.",
    summary: "환자는 사진만 보고도 ‘이 병원에 가도 괜찮겠다’는 감각을 얻습니다. 원장님 프로필, 설명하는 장면, 의료진의 표정과 태도가 신뢰의 핵심 증거가 됩니다.",
    risks: ["프로필이 딱딱하거나 오래되면 실제 실력보다 차갑게 보일 수 있습니다.", "진료 철학이 사진에 드러나지 않으면 가격·위치 중심 비교로 밀릴 수 있습니다."],
    neededShots: ["대표원장 프로필", "의료진 단체사진", "상담 장면", "환자 응대 장면", "설명하는 손/시선 디테일"],
  },
  "공간 이미지 강화형": {
    headline: "좋은 공간을 환자가 체감할 수 있는 이미지로 바꿔야 하는 상태입니다.",
    summary: "인테리어가 좋아도 사진에서 깊이감, 동선, 조명, 청결감이 살아나지 않으면 병원의 장점이 제대로 전달되지 않습니다. 공간컷과 사람의 움직임을 함께 설계하는 것이 좋습니다.",
    risks: ["공간만 찍으면 차갑고 비어 보일 수 있습니다.", "조명과 색감이 맞지 않으면 실제보다 답답하거나 오래된 병원처럼 보일 수 있습니다."],
    neededShots: ["로비·데스크 메인컷", "진료실·시술실", "동선이 보이는 와이드컷", "의료진이 포함된 공간컷", "청결·안전 디테일컷"],
  },
  "진료 장면 설계형": {
    headline: "진료 과정을 사진으로 설명해 불안을 낮춰야 하는 상태입니다.",
    summary: "환자는 실제로 어떤 과정을 거치는지 궁금해합니다. 상담, 검사, 장비 사용, 시술 준비, 사후 설명까지 시퀀스로 보여주면 신뢰와 이해도가 올라갑니다.",
    risks: ["장비나 시술 장면이 부족하면 전문성이 말로만 전달됩니다.", "과정 이미지가 없으면 홈페이지 설명이 추상적으로 느껴질 수 있습니다."],
    neededShots: ["상담 시퀀스", "검사·진단 장면", "장비 실사용 컷", "시술 전후 설명 장면", "사후관리 장면"],
  },
  "콘텐츠 확장형": {
    headline: "촬영 이미지를 홈페이지·SNS·검색 콘텐츠로 확장해야 하는 상태입니다.",
    summary: "사진은 한 번 찍고 끝나는 자료가 아니라 홈페이지, 플레이스, 블로그, SNS, 광고에 반복 사용되는 브랜드 자산입니다. 용도별 구도와 여백을 미리 설계해야 활용도가 높아집니다.",
    risks: ["SNS용 컷만 많고 홈페이지 메인컷이 부족해질 수 있습니다.", "검색·광고 콘텐츠에 필요한 증거 이미지가 빠질 수 있습니다."],
    neededShots: ["SNS용 세로컷", "홈페이지용 와이드컷", "블로그 설명용 디테일컷", "브랜드 영상 소스", "AI 검색 대응용 증거컷"],
  },
};

export function recommend(a: Answers): Recommendation {
  const diagnosisType = decideType(a);
  const copy = COPY[diagnosisType];
  const candidates: Package[] = [];
  const reasons: Partial<Record<Package, string>> = {};

  const highBudget = a.budget === "300-500" || a.budget === "500이상";
  const needsVideo = has(a.contents, "브랜드영상");
  const needsHomepage = has(a.contents, "홈페이지 제작") || has(a.usages, "홈페이지");
  const needsContent = has(a.contents, "블로그·SNS 콘텐츠") || has(a.contents, "언론홍보") || has(a.usages, "AI검색콘텐츠") || has(a.concerns, "AI검색대비");
  const manyNeeds = (a.contents?.length ?? 0) >= 4 || (a.usages?.length ?? 0) >= 4;

  if (needsVideo || (manyNeeds && highBudget) || a.stage === "개원예정") {
    candidates.push("Premium Plus");
    reasons["Premium Plus"] = needsVideo
      ? "브랜드 영상이 포함되어 있어 사진과 영상을 같은 톤으로 설계하는 Premium Plus가 적합합니다."
      : "개원/확장 단계에서는 기본 사진과 영상 소스를 함께 확보하는 구성이 효율적입니다.";
  }

  if (needsHomepage) {
    candidates.push("Homepage");
    reasons.Homepage = "홈페이지 사용 목적이 포함되어 있어 촬영과 페이지 구성을 함께 정리하는 Homepage 구성이 적합합니다.";
  }

  if (needsContent) {
    candidates.push("Branding Content");
    reasons["Branding Content"] = "SNS·언론·AI 검색 대응까지 고려해야 하므로 촬영 이후 콘텐츠 확장 설계가 필요합니다.";
  }

  if (candidates.length === 0 || a.stage === "촬영만") {
    candidates.push("Premium");
    reasons.Premium = "현재 선택 항목은 병원사진의 핵심인 프로필, 진료 연출, 공간 촬영 중심으로 정리할 수 있습니다.";
  }

  const priority: Package[] = ["Premium Plus", "Homepage", "Branding Content", "Premium"];
  const packages = priority.filter((p) => candidates.includes(p)).slice(0, 2);

  return {
    diagnosisType,
    headline: copy.headline,
    summary: copy.summary,
    risks: copy.risks,
    neededShots: copy.neededShots,
    packages: packages.length ? packages : ["Premium"],
    reasons,
    note: a.budget === "추천받기" ? "예산을 아직 정하지 않으셨다면, 필요한 사용처를 먼저 정리한 뒤 단계별 견적을 나누는 방식이 좋습니다." : undefined,
  };
}
