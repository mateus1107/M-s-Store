import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type MercadoLivreTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  user_id?: number;
  refresh_token?: string;
  error?: string;
  error_description?: string;
  message?: string;
};

export async function GET(request: NextRequest) {
  const clientId = process.env.MERCADOLIVRE_CLIENT_ID;
  const clientSecret = process.env.MERCADOLIVRE_CLIENT_SECRET;
  const redirectUri = process.env.MERCADOLIVRE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      {
        success: false,
        error: "As credenciais do Mercado Livre não estão configuradas.",
      },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const authorizationError = searchParams.get("error");

  if (authorizationError) {
    return NextResponse.json(
      {
        success: false,
        error: "A autorização foi cancelada ou recusada.",
        details: authorizationError,
      },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      {
        success: false,
        error: "O Mercado Livre não enviou o código de autorização.",
      },
      { status: 400 }
    );
  }

  const savedState = request.cookies.get("ml_oauth_state")?.value;

  if (!state || !savedState || state !== savedState) {
    return NextResponse.json(
      {
        success: false,
        error: "Falha na validação de segurança da autorização.",
      },
      { status: 400 }
    );
  }

  try {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    });

    const tokenResponse = await fetch(
      "https://api.mercadolibre.com/oauth/token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
        cache: "no-store",
      }
    );

    const tokenData =
      (await tokenResponse.json()) as MercadoLivreTokenResponse;

    if (
      !tokenResponse.ok ||
      !tokenData.access_token ||
      !tokenData.user_id
    ) {
      console.error("Erro ao gerar token do Mercado Livre:", tokenData);

      return NextResponse.json(
        {
          success: false,
          error: "Não foi possível gerar o token do Mercado Livre.",
          details:
            tokenData.error_description ||
            tokenData.message ||
            tokenData.error ||
            "Resposta inválida do Mercado Livre.",
        },
        { status: tokenResponse.status || 400 }
      );
    }

    const expiresIn = tokenData.expires_in || 21600;
    const expiresAt = new Date(
      Date.now() + expiresIn * 1000
    ).toISOString();

    const supabaseAdmin = getSupabaseAdmin();

    const { error: saveError } = await supabaseAdmin
      .from("mercadolivre_connections")
      .upsert(
        {
          ml_user_id: tokenData.user_id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || null,
          token_type: tokenData.token_type || "Bearer",
          scope: tokenData.scope || null,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "ml_user_id",
        }
      );

    if (saveError) {
      console.error(
        "Erro ao salvar token no Supabase:",
        saveError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "O Mercado Livre autorizou, mas não foi possível salvar a conexão no Supabase.",
          details: saveError.message,
        },
        { status: 500 }
      );
    }

    const response = NextResponse.redirect(
      new URL("/admin?mercadolivre=conectado", request.url)
    );

    response.cookies.set("ml_user_id", String(tokenData.user_id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 180,
    });

    response.cookies.delete("ml_oauth_state");

    return response;
  } catch (error) {
    console.error(
      "Erro na autenticação do Mercado Livre:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Erro interno durante a autenticação do Mercado Livre.",
      },
      { status: 500 }
    );
  }
}