import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  console.log("Webhook Mercado Livre:");
  console.log(body);

  return NextResponse.json({
    success: true,
  });
}

export async function GET() {
  return NextResponse.json({
    status: "Webhook funcionando",
  });
}