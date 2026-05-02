# 포토클리닉 맞춤형 진단 웹앱 (v4 정식)

병원 전문 사진·영상 에이전시 [포토클리닉](http://photoclinic.kr)의 8단계 견적 진단 서비스.
미리보기 v4와 100% 동일한 디자인을 Next.js 풀스택으로 구현한 정식 버전입니다.

## 🎨 디자인 사양 (v4)

- **배경**: `#E5F0EE` 단일 라이트 민트 그린
- **진단 단계 액센트**: `#E6622A` 오렌지 (포토클리닉 PHOTO 컬러)
- **결과 단계 액센트**: `#0F5254` 딥 그린 (포토클리닉 CLINIC 컬러)
- **폰트**: Pretendard 단일 고딕 (영문/한글)
- **로고**: photoclinic.kr 실제 SVG 로고 (`/public/logo.svg`)
- 카메라 데코·뷰파인더 등 장식 요소 모두 제거

## ⚙️ 기술 스택

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (커스텀 컬러 토큰)
- Framer Motion (페이지 전환 애니메이션)
- React Hook Form + Zod (Q8 폼 검증)
- Zustand + persist (답변 상태 + localStorage)
- Supabase (진단 결과 저장)
- Resend (자동 회신 메일, 선택)

## 🚀 빠른 시작 (로컬)

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 파일 생성 후 값 채우기
cp .env.example .env.local

# 3. 개발 서버 실행
npm run dev
# → http://localhost:3000
```

## 📦 Supabase 셋업 (5분)

1. [supabase.com](https://supabase.com) → "Start your project" → GitHub 로그인
2. "New Project" → 이름 `photoclinic`, 리전 **Northeast Asia (Seoul)** 권장
3. 좌측 메뉴 **"SQL Editor"** → "New query" → 아래 SQL 실행:

```sql
create table diagnoses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  stage text,
  department text,
  location text,
  impressions text[],
  contents text[],
  budget text,
  timeline text,
  hospital_name text not null,
  phone text not null,
  email text not null,
  consultation_optin boolean default true
);
alter table diagnoses enable row level security;
create policy "anon insert" on diagnoses for insert to anon with check (true);
```

4. **"Project Settings" → "API"** 에서 두 값 복사 → `.env.local` 에 입력:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key

> Supabase 키가 없으면 진단은 정상 동작하지만 결과는 저장되지 않습니다 (콘솔 로그만 남음).

## 📨 Resend 자동 회신 (선택)

1. [resend.com](https://resend.com) 가입 → API Key 발급
2. `.env.local` 에 추가:
   - `RESEND_API_KEY=re_xxx`
   - `RESEND_FROM=director@photoclinic.kr` (도메인 인증 필요)
   - `ADMIN_NOTIFY_EMAIL=` (관리자 알림 받을 이메일)

## ☁️ Vercel 배포

1. 이 폴더를 GitHub 저장소에 푸시
2. [vercel.com](https://vercel.com) → "Add New Project" → 저장소 Import
3. **Environment Variables** 에 `.env.example` 의 모든 값 등록
4. Deploy → 약 2분 후 `xxx.vercel.app` 주소 발급
5. (선택) Settings → Domains 에서 `diagnose.photoclinic.kr` 연결
   → photoclinic.kr DNS 관리에서 CNAME 레코드 설정

## 📁 폴더 구조

```
app/
  layout.tsx              # Pretendard + GA4
  globals.css             # 라이트 톤 글로벌
  page.tsx                # 인트로 (오렌지 액센트)
  diagnosis/page.tsx      # 8단계 질문
  result/page.tsx         # 결과 (그린 액센트)
  api/submit/route.ts     # Supabase insert + Resend 메일
components/
  Logo.tsx                # 실제 photoclinic 로고
  ProgressBar.tsx         # 상단 고정 진행률
  QuestionCard.tsx        # 질문 래퍼 + Framer Motion
  OptionButton.tsx        # 단일/복수 선택 옵션
  PackageRecommendation.tsx
  CaseStudyCard.tsx
lib/
  questions.ts            # 8개 질문 데이터
  recommendation.ts       # 매핑 룰
  store.ts                # Zustand + persist
  supabase.ts             # 클라이언트
  utils.ts                # 전화번호 포맷터
types/index.ts            # 공용 타입
public/logo.svg           # photoclinic.kr 실제 로고
```

## 📊 추천 패키지 매핑 룰

우선순위: **Premium Plus > Homepage > Branding Content > Premium**

| 조건 | 추천 |
|---|---|
| 컨텐츠에 "홈페이지 제작" | Homepage |
| "브랜드 영상" + 예산 300만원 이상 | Premium Plus |
| 컨텐츠에 "언론 홍보" | Branding Content |
| 신규개원 + 컨텐츠 3개 이상 | Premium Plus |
| 촬영만 / 사진 항목만 | Premium |
| 예산 "추천받기" | Premium 안내 노트 추가 |

최대 2개까지 카드로 노출됩니다.

## 🔐 보안 메모

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 는 클라이언트에 노출되는 공개 키 (정상)
- RLS(Row Level Security) 정책으로 익명 사용자는 INSERT만 가능
- 진단 데이터 조회는 Supabase 대시보드에서만 가능
