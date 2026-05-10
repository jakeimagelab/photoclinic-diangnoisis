import { NextResponse } from "next/server";

function normalizeArray(value: unknown) {
  return Array.isArray(value) ? value : [];
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

    const payload = {
      submittedAt: new Date().toISOString(),
      hospitalName: body.hospitalName ?? "",
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

    let result: any = {};
    try {
      result = JSON.parse(text);
    } catch {
      result = { raw: text };
    }

    if (result.ok === false) {
      return NextResponse.json(
        {
          ok: false,
          error: "Google Apps Script 처리 실패",
          detail: result,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      saved: true,
      googleSheetResult: result,
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
