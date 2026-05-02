export const TOTAL_STEPS = 8;

export const Q1_OPTIONS = [
  { value: "신규개원", label: "곧 개원 예정", sub: "신규 오픈" },
  { value: "리뉴얼", label: "이미 운영 중 / 리뉴얼 필요", sub: "" },
  { value: "정기관리", label: "정기적인 콘텐츠 관리가 필요", sub: "" },
  { value: "촬영만", label: "촬영만 필요", sub: "" },
] as const;

export const Q2_OPTIONS = [
  "피부과", "성형외과", "치과", "안과", "정형외과",
  "신경외과", "마취통증의학과", "한방병원(한의원)", "검진내과", "기타",
] as const;

export const Q4_OPTIONS = [
  "프리미엄·럭셔리", "신뢰감·전문성", "따뜻함·편안함", "모던·미니멀",
  "트렌디·감각적", "친근함·캐주얼", "자연·내추럴", "권위·정통",
] as const;

export const Q5_OPTIONS = [
  "의료진 프로필", "인테리어·분위기", "진료연출", "브랜드영상",
  "홈페이지 제작", "언론홍보", "퍼스널이미지컨설팅",
] as const;

export const Q6_OPTIONS = [
  { value: "100이하", label: "100만 원 이하" },
  { value: "100-200", label: "100~200만 원" },
  { value: "200-300", label: "200~300만 원" },
  { value: "300-500", label: "300~500만 원" },
  { value: "500이상", label: "500만 원 이상" },
  { value: "추천받기", label: "추천을 받고 결정하고 싶음" },
] as const;

export const Q7_OPTIONS = [
  { value: "2주내", label: "2주 내" },
  { value: "1개월내", label: "1개월 내" },
  { value: "2-3개월내", label: "2~3개월 내" },
  { value: "미정", label: "미정" },
] as const;
