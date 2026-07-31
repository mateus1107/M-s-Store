import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      message: "Webhook da M&S Store ativo",
    },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  let body: unknown = null;

  try {
    const text = await request.text();

    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }
  } catch {
    body = null;
  }

  console.log("Notificação do Mercado Livre:", body);

  return NextResponse.json(
    {
      received: true,
    },
    { status: 200 }
  );
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}