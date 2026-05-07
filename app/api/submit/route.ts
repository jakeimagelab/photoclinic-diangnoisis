import { NextResponse } from "next/server";
import { supabase, isSupabaseEnabled } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Supabase 저장 (환경변수 설정된 경우만)
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from("diagnoses").insert({
        stage: body.stage ?? null,
        department: body.department ?? null,
        location: body.location ?? null,
        concerns: body.concerns ?? [],
        usages: body.usages ?? [],
        impressions: body.impressions ?? [],
        contents: body.contents ?? [],
        budget: body.budget ?? null,
        timeline: body.timeline ?? null,
        hospital_name: body.hospitalName,
        phone: body.phone,
        email: body.email,
        consultation_optin: body.consultationOptin ?? true,
      });
      if (error) console.error("[supabase insert error]", error.message);
    } else {
      console.log("[diagnosis submit - no DB]", JSON.stringify(body));
    }

    // Resend 자동 회신 메일 (환경변수 설정된 경우만)
    const resendKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM;
    if (resendKey && resendFrom && body.email) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: resendFrom,
            to: body.email,
            subject: "[포토클리닉] 병원사진 진단 신청이 접수되었습니다",
            html: `<div style="font-family:Pretendard,sans-serif;color:#1A1A1A;line-height:1.7">
              <p>${body.hospitalName ?? ""} 원장님,</p>
              <p>포토클리닉 병원사진 진단 신청이 정상적으로 접수되었습니다.<br/>
              남겨주신 내용을 바탕으로 필요한 촬영 방향을 정리해 연락드리겠습니다.</p>
              <p style="color:#6B7572;font-size:13px">— 포토클리닉</p>
            </div>`,
          }),
        });
      } catch (e) {
        console.error("[resend error]", e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 400 });
  }
}
