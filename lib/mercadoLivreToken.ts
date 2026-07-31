import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type MercadoLivreConnection = {
  id: number;
  ml_user_id: number;
  access_token: string;
  refresh_token: string | null;
  token_type: string | null;
  scope: string | null;
  expires_at: string;
};

type RefreshTokenResponse = {
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

export async function getMercadoLivreAccessToken(): Promise<string> {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: connection, error: connectionError } =
    await supabaseAdmin
      .from("mercadolivre_connections")
      .select(
        `
        id,
        ml_user_id,
        access_token,
        refresh_token,
        token_type,
        scope,
        expires_at
        `
      )
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle<MercadoLivreConnection>();

  if (connectionError) {
    throw new Error(
      `Erro ao buscar conexão do Mercado Livre: ${connectionError.message}`
    );
  }

  if (!connection) {
    throw new Error(
      "Nenhuma conexão do Mercado Livre foi encontrada."
    );
  }

  const expirationTime = new Date(connection.expires_at).getTime();
  const fiveMinutes = 5 * 60 * 1000;

  // Ainda está válido por mais de 5 minutos.
  if (expirationTime > Date.now() + fiveMinutes) {
    return connection.access_token;
  }

  if (!connection.refresh_token) {
    throw new Error(
      "O refresh token não foi encontrado. Conecte novamente ao Mercado Livre."
    );
  }

  const clientId = process.env.MERCADOLIVRE_CLIENT_ID;
  const clientSecret = process.env.MERCADOLIVRE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "As credenciais do Mercado Livre não estão configuradas."
    );
  }

  const requestBody = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: connection.refresh_token,
  });

  const refreshResponse = await fetch(
    "https://api.mercadolibre.com/oauth/token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: requestBody.toString(),
      cache: "no-store",
    }
  );

  const refreshData =
    (await refreshResponse.json()) as RefreshTokenResponse;

  if (!refreshResponse.ok || !refreshData.access_token) {
    throw new Error(
      refreshData.error_description ||
        refreshData.message ||
        refreshData.error ||
        "Não foi possível renovar o token do Mercado Livre."
    );
  }

  const expiresIn = refreshData.expires_in || 21600;
  const expiresAt = new Date(
    Date.now() + expiresIn * 1000
  ).toISOString();

  const { error: updateError } = await supabaseAdmin
    .from("mercadolivre_connections")
    .update({
      access_token: refreshData.access_token,
      refresh_token:
        refreshData.refresh_token || connection.refresh_token,
      token_type:
        refreshData.token_type || connection.token_type || "Bearer",
      scope: refreshData.scope || connection.scope,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", connection.id);

  if (updateError) {
    throw new Error(
      `O token foi renovado, mas não pôde ser salvo: ${updateError.message}`
    );
  }

  return refreshData.access_token;
}