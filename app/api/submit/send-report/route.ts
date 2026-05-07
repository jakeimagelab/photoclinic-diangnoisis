import { NextResponse } from "next/server";
import { recommend, packageInfo } from "@/lib/recommendation";
import type { Answers } from "@/types";

function esc(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function joinList(value?: readonly string[]) {
  return value && value.length ? value.join(", ") : "-";
}

function field(label: string, value: unknown) {
  return `
    <tr>
      <td style="width:150px;padding:10px 0;color:#6B7572;font-size:13px;border-bottom:1px solid #E8ECE9;vertical-align:top">${label}</td>
      <td style="padding:10px 0;color:#1A1A1A;font-size:14px;border-bottom:1px solid #E8ECE9;vertical-align:top;font-weight:600">${esc(value || "-")}</td>
    </tr>
  `;
}

function renderReportEmail(answers: Answers) {
  const rec = recommend(answers);
  const primaryPackage = rec.packages[0];
  const primaryPackageInfo = primaryPackage ? packageInfo(primaryPackage) : null;

  return `
  <div style="margin:0;padding:0;background:#F7F3ED;font-family:Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;color:#1A1A1A;line-height:1.7">
    <div style="max-width:720px;margin:0 auto;padding:32px 18px">
      <div style="background:#ffffff;border:1px solid #DDE5DF;border-radius:18px;overflow:hidden">
        <div style="padding:30px 30px 24px;background:#0F5254;color:#ffffff">
          <div style="font-size:12px;letter-spacing:1.8px;font-weight:700;color:#F3B08A">PHOTOCLINIC DIAGNOSIS REPORT</div>
          <h1 style="margin:12px 0 0;font-size:26px;line-height:1.35;letter-spacing:-0.5px">${esc(answers.hospitalName || "병원")}<br/>병원사진 진단 요약</h1>
          <p style="margin:14px 0 0;color:#E7F0EC;font-size:15px">진단 결과: <strong style="color:#ffffff">${esc(rec.diagnosisType)}</strong></p>
        </div>

        <div style="padding:28px 30px">
          <p style="margin:0 0 20px;color:#384642;font-size:15px">${esc(rec.headline)}</p>

          <div style="border:1px solid #E8ECE9;border-radius:14px;padding:20px;margin:24px 0;background:#FBFCFA">
            <div style="font-size:12px;letter-spacing:1.5px;color:#0F5254;font-weight:700;margin-bottom:8px">PHOTO PRESCRIPTION</div>
            <h2 style="margin:0 0 10px;font-size:20px;letter-spacing:-0.3px">병원사진 촬영 처방전</h2>
            <p style="margin:0;color:#384642;font-size:14px">${esc(rec.summary)}</p>
          </div>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:18px">
            ${field("진료과", answers.department)}
            ${field("지역", answers.location)}
            ${field("병원 단계", answers.stage)}
            ${field("현재 고민", joinList(answers.concerns))}
            ${field("사용처", joinList(answers.usages))}
            ${field("원하는 이미지", joinList(answers.impressions))}
            ${field("필요 촬영", joinList(answers.contents))}
            ${field("예산", answers.budget)}
            ${field("진행 시점", answers.timeline)}
          </table>

          <div style="margin-top:26px">
            <div style="font-size:12px;letter-spacing:1.5px;color:#0F5254;font-weight:700;margin-bottom:10px">RECOMMENDED SHOTS</div>
            <ol style="margin:0;padding-left:20px;color:#1A1A1A;font-size:14px">
              ${rec.neededShots.map((shot) => `<li style="margin:6px 0">${esc(shot)}</li>`).join("")}
            </ol>
          </div>

          <div style="margin-top:26px;padding:18px 20px;border-left:4px solid #E85D2C;background:#FFF7F2;border-radius:10px">
            <div style="font-size:12px;letter-spacing:1.5px;color:#E85D2C;font-weight:700;margin-bottom:6px">RECOMMENDED PACKAGE</div>
            <div style="font-size:18px;font-weight:800;color:#1A1A1A">${esc(primaryPackageInfo?.ko || primaryPackage || "Premium")}</div>
            <p style="margin:8px 0 0;color:#384642;font-size:14px">${esc(primaryPackage ? rec.reasons[primaryPackage] || "병원사진의 핵심 구성을 중심으로 촬영 방향을 정리하는 것이 좋습니다." : "병원사진의 핵심 구성을 중심으로 촬영 방향을 정리하는 것이 좋습니다.")}</p>
          </div>

          <div style="margin-top:28px;padding-top:20px;border-top:1px solid #E8ECE9;color:#6B7572;font-size:13px">
            본 자료는 포토클리닉 병원사진 진단페이지에서 입력하신 내용을 바탕으로 자동 생성된 1페이지 요약 리포트입니다.<br/>
            상담 시 이 내용을 기준으로 촬영 범위, 동선, 홈페이지·플레이스 활용 방식을 함께 정리해드립니다.
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Answers;

    if (!body.email) {
      return NextResponse.json({ ok: false, error: "이메일 주소가 없습니다." }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM;

    if (!resendKey || !resendFrom) {
      console.log("[send-report - no email provider]", JSON.stringify(body));
      return NextResponse.json({
        ok: true,
        previewOnly: true,
        message: "메일 발송 환경변수가 없어 실제 발송은 생략되었습니다.",
      });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFrom,
        to: body.email,
        subject: `[포토클리닉] ${body.hospitalName || "병원"} 병원사진 진단 요약 리포트`,
        html: renderReportEmail(body),
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "메일 발송에 실패했습니다.");
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[send-report error]", e);
    return NextResponse.json({ ok: false, error: e?.message ?? "메일 발송 중 오류가 발생했습니다." }, { status: 500 });
  }
}
