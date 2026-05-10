import { NextResponse } from "next/server";
import { supabase, isSupabaseEnabled } from "@/lib/supabase";

function normalizeArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function formatUploadedPhotos(value: unknown) {
  if (!Array.isArray(value)) return "";

  return value
    .map((photo: any) => {
      const category = photo?.category || "";
      const name = photo?.name || "";
      return category || name ? `[${category}] ${name}` : "";
    })
    .filter(Boolean)
    .join(", ");
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    hasGoogleSheetUrl: Boolean(process.env.GOOGLE_SHEET_WEBHOOK_URL),
    googleSheetUrlPrefix: process.env.GOOGLE_SHEET_WEBHOOK_URL
      ? process.env.GOOGLE_SHEET_WEBHOOK_URL.slice(0, 45) + "..."
      : null,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const googleSheetWebhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;

    if (!googleSheetWebhookUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: "GOOGLE_SHEET_WEBHOOK_URL 환경변수가 없습니다.",
        },
        { status: 500 }
      );
    }

    const uploadedPhotos = normalizeArray(body.uploadedPhotos);

    const payload = {
      submittedAt: new Date().toISOString(),

      hospitalName: body.hospitalName ?? "",
      contactRole: body.contactRole ?? "",
      phone: body.phone ?? "",
      email: body.email ?? "",
      location: body.location ?? "",

      stage: body.stage ?? "",
      department: body.department ?? "",
      concerns: normalizeArray(body.concerns),
      usages: normalizeArray(body.usages),
      impressions: normalizeArray(body.impressions),
      contents: normalizeArray(body.contents),
      budget: body.budget ?? "",
      timeline: body.timeline ?? "",

      uploadedPhotos,
      uploadedPhotosText: formatUploadedPhotos(uploadedPhotos),
      photoUploadConsent: body.photoUploadConsent ?? false,
      photoMemo: body.photoMemo ?? "",

      consultationOptin: body.consultationOptin ?? true,
    };

    const response = await fetch(googleSheetWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Google Apps Script 요청 실패",
          status: response.status,
          detail: text,
        },
        { status: 500 }
      );
    }

    let googleSheetResult: any = {};
    try {
      googleSheetResult = JSON.parse(text);
    } catch {
      googleSheetResult = { raw: text };
    }

    if (googleSheetResult.ok === false) {
      return NextResponse.json(
        {
          ok: false,
          error: "Google Apps Script 처리 실패",
          detail: googleSheetResult,
        },
        { status: 500 }
      );
    }

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

        hospital_name: body.hospitalName ?? null,
        contact_role: body.contactRole ?? null,
        phone: body.phone ?? null,
        email: body.email ?? null,

        uploaded_photos: uploadedPhotos,
        photo_upload_consent: body.photoUploadConsent ?? false,
        photo_memo: body.photoMemo ?? null,

        consultation_optin: body.consultationOptin ?? true,
      });

      if (error) {
        console.error("[supabase insert error]", error.message);
      }
    }

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
            subject: `[포토클리닉 진단문의] ${
              body.hospitalName ?? "병원명 미입력"
            }`,
            html: `<div style="font-family:Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;color:#1A1A1A;line-height:1.7">
              <h2>포토클리닉 진단문의가 접수되었습니다.</h2>

              <p><strong>병원명:</strong> ${body.hospitalName ?? ""}</p>
              <p><strong>문의자 유형:</strong> ${body.contactRole ?? ""}</p>
              <p><strong>연락처:</strong> ${body.phone ?? ""}</p>
              <p><strong>이메일:</strong> ${body.email ?? ""}</p>
              <p><strong>지역:</strong> ${body.location ?? ""}</p>

              <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />

              <p><strong>병원 단계:</strong> ${body.stage ?? ""}</p>
              <p><strong>진료과:</strong> ${body.department ?? ""}</p>
              <p><strong>현재 고민:</strong> ${normalizeArray(body.concerns).join(", ")}</p>
              <p><strong>사용처:</strong> ${normalizeArray(body.usages).join(", ")}</p>
              <p><strong>원하는 이미지:</strong> ${normalizeArray(body.impressions).join(", ")}</p>
              <p><strong>필요 촬영:</strong> ${normalizeArray(body.contents).join(", ")}</p>
              <p><strong>예산:</strong> ${body.budget ?? ""}</p>
              <p><strong>진행 시점:</strong> ${body.timeline ?? ""}</p>

              <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />

              <p><strong>업로드 사진:</strong> ${formatUploadedPhotos(uploadedPhotos) || "없음"}</p>
              <p><strong>사진 업로드 동의:</strong> ${
                body.photoUploadConsent ? "동의" : "미동의"
              }</p>
              <p><strong>사진 관련 메모:</strong> ${body.photoMemo ?? ""}</p>
            </div>`,
          }),
        });
      } catch (error) {
        console.error("[owner notification error]", error);
      }
    }

    return NextResponse.json({
      ok: true,
      saved: true,
      googleSheetResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "submit failed",
      },
      { status: 500 }
    );
  }
}
