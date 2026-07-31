import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.MERCADOLIVRE_CLIENT_ID;
  const redirectUri = process.env.MERCADOLIVRE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        success: false,
        error:
          "MERCADOLIVRE_CLIENT_ID ou MERCADOLIVRE_REDIRECT_URI não configurado.",
      },
      {
        status: 500,
      }
    );
  }

  // Código aleatório usado para proteger a autorização.
  const state = randomUUID();

  const authorizationUrl = new URL(
    "https://auth.mercadolivre.com.br/authorization"
  );

  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizationUrl);

  response.cookies.set("ml_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  return response;
}