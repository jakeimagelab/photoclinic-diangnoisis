import { NextResponse } from "next/server";
import { supabase, isSupabaseEnabled } from "@/lib/supabase";

function normalizeArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1) Google Sheet 저장 (초기 DB 확보용)
    const googleSheetWebhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (googleSheetWebhookUrl) {
      try {
        const response = await fetch(googleSheetWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submittedAt: new Date().toISOString(),
            stage: body.stage ?? "",
            department: body.department ?? "",
            location: body.location ?? "",
            concerns: normalizeArray(body.concerns),
            usages: normalizeArray(body.usages),
            impressions: normalizeArray(body.impressions),
            contents: normalizeArray(body.contents),
            budget: body.budget ?? "",
            timeline: body.timeline ?? "",
            hospitalName: body.hospitalName ?? "",
            phone: body.phone ?? "",
            email: body.email ?? "",
            consultationOptin: body.consultationOptin ?? true,
            photoUploadConsent: body.photoUploadConsent ?? false,
            uploadedPhotos: normalizeArray(body.uploadedPhotos),
            photoMemo: body.photoMemo ?? "",
          }),
        });

        if (!response.ok) {
          const text = await response.text();
          console.error("[google sheet webhook error]", text);
        }
      } catch (e) {
        console.error("[google sheet webhook error]", e);
      }
    }

    // 2) Supabase 저장 (나중에 관리자 페이지로 확장할 때 사용)
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from("diagnoses").insert({
        stage: body.stage ?? null,
        department: body.department ?? null,
        location: body.location ?? null,
        concerns: normalizeArray(body.concerns),
        usages: normalizeArray(body.usages),
        impressions: normalizeArray(body.impressions),
        contents: normalizeArray(body.contents),
        budget: body.budget ?? null,
        timeline: body.timeline ?? null,
        hospital_name: body.hospitalName,
        phone: body.phone,
        email: body.email,
        consultation_optin: body.consultationOptin ?? true,
        // 아래 컬럼은 Supabase 테이블에 추가한 뒤 사용하세요.
        // photo_upload_consent: body.photoUploadConsent ?? false,
        // uploaded_photos: normalizeArray(body.uploadedPhotos),
        // photo_memo: body.photoMemo ?? null,
      });
      if (error) console.error("[supabase insert error]", error.message);
    }

    if (!googleSheetWebhookUrl && !isSupabaseEnabled) {
      console.log("[diagnosis submit - no DB]", JSON.stringify(body));
    }

    // 3) 대표님 알림 메일 (선택 환경변수 설정 시)
    const resendKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM;
    const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL;
    if (resendKey && resendFrom && ownerEmail) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: resendFrom,
            to: ownerEmail,
            subject: `[포토클리닉 진단문의] ${body.hospitalName ?? "병원명 미입력"}`,
            html: `<div style="font-family:Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;color:#1A1A1A;line-height:1.7">
              <h2>포토클리닉 진단문의가 접수되었습니다.</h2>
              <p><strong>병원명:</strong> ${body.hospitalName ?? ""}</p>
              <p><strong>연락처:</strong> ${body.phone ?? ""}</p>
              <p><strong>이메일:</strong> ${body.email ?? ""}</p>
              <p><strong>진료과:</strong> ${body.department ?? ""}</p>
              <p><strong>지역:</strong> ${body.location ?? ""}</p>
              <p><strong>현재 고민:</strong> ${normalizeArray(body.concerns).join(", ")}</p>
              <p><strong>필요 촬영:</strong> ${normalizeArray(body.contents).join(", ")}</p>
              <p><strong>예산:</strong> ${body.budget ?? ""}</p>
              <p><strong>진행 시점:</strong> ${body.timeline ?? ""}</p>
              <p><strong>사진 업로드 동의:</strong> ${body.photoUploadConsent ? "동의" : "미동의/미업로드"}</p>
              <p><strong>업로드 파일:</strong> ${normalizeArray(body.uploadedPhotos).map((p: any) => `${p.category || "사진"}: ${p.name || ""}`).join(" / ")}</p>
              <p><strong>사진 관련 메모:</strong> ${body.photoMemo ?? ""}</p>
            </div>`,
          }),
        });
      } catch (e) {
        console.error("[owner notification error]", e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 400 });
  }
}
