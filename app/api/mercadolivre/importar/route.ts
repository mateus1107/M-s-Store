import { NextRequest, NextResponse } from "next/server";

import { getMercadoLivreAccessToken } from "@/lib/mercadoLivreToken";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type HighlightEntry = {
  id: string;
  position: number;
  type: "ITEM" | "PRODUCT" | "USER_PRODUCT";
};

type HighlightsResponse = {
  content?: HighlightEntry[];
  message?: string;
  error?: string;
};

type MercadoLivreItem = {
  id?: string;
  title?: string;
  price?: number;
  original_price?: number | null;
  thumbnail?: string;
  pictures?: Array<{
    secure_url?: string;
    url?: string;
  }>;
  permalink?: string;
  status?: string;
  category_id?: string;
};

type MultiGetResult = {
  code: number;
  body?: MercadoLivreItem;
};

async function importProducts(request: NextRequest) {
  const mercadoLivreUserId =
    request.cookies.get("ml_user_id")?.value;

  if (!mercadoLivreUserId) {
    return NextResponse.json(
      {
        success: false,
        error:
          "A conexão com o Mercado Livre não foi encontrada neste navegador.",
        reconnectUrl: "/api/auth/mercadolivre",
      },
      { status: 401 }
    );
  }

  try {
    const accessToken =
      await getMercadoLivreAccessToken();

    /*
     * Categoria utilizada inicialmente pelo recurso oficial
     * de produtos mais vendidos.
     */
    const categoryId = "MLB432825";

    const highlightsResponse = await fetch(
      `https://api.mercadolibre.com/highlights/MLB/category/${categoryId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    const highlightsData =
      (await highlightsResponse.json()) as HighlightsResponse;

    if (!highlightsResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Não foi possível consultar os produtos mais vendidos.",
          details:
            highlightsData.message ||
            highlightsData.error ||
            "Erro desconhecido do Mercado Livre.",
        },
        { status: highlightsResponse.status }
      );
    }

    const itemIds = (highlightsData.content || [])
      .filter((entry) => entry.type === "ITEM")
      .sort((first, second) => first.position - second.position)
      .map((entry) => entry.id)
      .slice(0, 20);

    if (itemIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "O ranking consultado não retornou anúncios do tipo ITEM.",
          details:
            "Os resultados encontrados eram produtos de catálogo. Eles serão adicionados na próxima etapa.",
        },
        { status: 404 }
      );
    }

    const itemDetailsUrl = new URL(
      "https://api.mercadolibre.com/items"
    );

    itemDetailsUrl.searchParams.set(
      "ids",
      itemIds.join(",")
    );

    itemDetailsUrl.searchParams.set(
      "attributes",
      [
        "id",
        "title",
        "price",
        "original_price",
        "thumbnail",
        "pictures",
        "permalink",
        "status",
        "category_id",
      ].join(",")
    );

    const itemDetailsResponse = await fetch(
      itemDetailsUrl,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!itemDetailsResponse.ok) {
      const errorText = await itemDetailsResponse.text();

      return NextResponse.json(
        {
          success: false,
          error:
            "Não foi possível consultar os detalhes dos produtos.",
          details: errorText,
        },
        { status: itemDetailsResponse.status }
      );
    }

    const itemResults =
      (await itemDetailsResponse.json()) as MultiGetResult[];

    const products = itemResults
      .filter(
        (result) =>
          result.code === 200 &&
          result.body?.id &&
          result.body?.title &&
          result.body?.price &&
          result.body?.permalink
      )
      .map((result) => {
        const item = result.body as Required<
          Pick<
            MercadoLivreItem,
            "id" | "title" | "price" | "permalink"
          >
        > &
          MercadoLivreItem;

        const firstPicture =
          item.pictures?.[0]?.secure_url ||
          item.pictures?.[0]?.url ||
          item.thumbnail ||
          "";

        const imageUrl = firstPicture.replace(
          /^http:/,
          "https:"
        );

        return {
          ml_id: item.id,
          name: item.title,
          description: null,
          category:
            item.category_id || "Mercado Livre",
          image_url: imageUrl,
          price: Number(item.price),
          old_price:
            item.original_price !== null &&
            item.original_price !== undefined
              ? Number(item.original_price)
              : null,

          /*
           * Não colocaremos o link comum no campo de afiliado.
           * Isso evita confundir um link normal com um link
           * que realmente gera comissão.
           */
          affiliate_url: null,

          product_url: item.permalink,
          active: item.status === "active",
          updated_at: new Date().toISOString(),
        };
      })
      .filter(
        (product) =>
          product.image_url &&
          Number.isFinite(product.price) &&
          product.price > 0
      );

    if (products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Nenhum produto válido foi encontrado para cadastro.",
        },
        { status: 404 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: savedProducts, error: saveError } =
      await supabaseAdmin
        .from("products")
        .upsert(products, {
          onConflict: "ml_id",
          ignoreDuplicates: false,
        })
        .select("id, ml_id, name, price");

    if (saveError) {
      console.error(
        "Erro ao cadastrar produtos automáticos:",
        saveError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Os produtos foram encontrados, mas não puderam ser salvos.",
          details: saveError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${savedProducts?.length || 0} produtos foram importados ou atualizados.`,
      imported: savedProducts?.length || 0,
      products: savedProducts || [],
      affiliateLinks:
        "pendentes — os links comuns não foram salvos como links de comissão",
    });
  } catch (error) {
    console.error(
      "Erro durante a importação automática:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro interno durante a importação.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return importProducts(request);
}

export async function POST(request: NextRequest) {
  return importProducts(request);
}