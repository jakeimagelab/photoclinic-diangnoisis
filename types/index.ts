export type Stage = "신규개원" | "리뉴얼" | "정기관리" | "촬영만";
export type Department =
  | "피부과" | "성형외과" | "치과" | "한의원" | "안과"
  | "정신건강의학과" | "산부인과" | "정형외과" | "가정의학과" | "기타";
export type Impression =
  | "프리미엄·럭셔리" | "신뢰감·전문성" | "따뜻함·편안함" | "모던·미니멀"
  | "트렌디·감각적" | "친근함·캐주얼" | "자연·내추럴" | "권위·정통";
export type Content =
  | "의료진 프로필" | "인테리어·공간 사진" | "진료 연출 컷" | "브랜드 영상"
  | "홈페이지 제작" | "블로그·SNS 콘텐츠" | "언론 홍보";
export type Budget =
  | "100이하" | "100-200" | "200-300" | "300-500" | "500이상" | "추천받기";
export type Timeline = "2주내" | "1개월내" | "2-3개월내" | "미정";
export type Package = "Premium" | "Premium Plus" | "Homepage" | "Branding Content";

export interface Answers {
  stage?: Stage;
  department?: Department;
  location?: string;
  impressions: Impression[];
  contents: Content[];
  budget?: Budget;
  timeline?: Timeline;
  hospitalName?: string;
  phone?: string;
  email?: string;
  consultationOptin: boolean;
}
