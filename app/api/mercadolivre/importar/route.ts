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

type CatalogPicture = {
  id?: string;
  url?: string;
  secure_url?: string;
};

type CatalogProduct = {
  id?: string;
  status?: string;
  domain_id?: string;
  permalink?: string;
  name?: string;
  family_name?: string;
  pictures?: CatalogPicture[];
  short_description?: {
    content?: string;
  } | null;
  buy_box_winner?: {
    item_id?: string;
    category_id?: string;
    price?: number;
    original_price?: number | null;
    currency_id?: string;
    condition?: string;
    available_quantity?: number;
  } | null;
};

async function fetchCatalogProduct(
  productId: string,
  accessToken: string
): Promise<CatalogProduct | null> {
  try {
    const response = await fetch(
      `https://api.mercadolibre.com/products/${productId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.warn(
        `CATALOGO_ML_ERRO product_id=${productId} status=${response.status}`
      );
      return null;
    }

    return (await response.json()) as CatalogProduct;
  } catch (error) {
    console.warn(
      `CATALOGO_ML_FALHA product_id=${productId}`,
      error
    );
    return null;
  }
}

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
     * Categoria inicial usada pelo ranking oficial
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

    const orderedHighlights = (
      highlightsData.content || []
    ).sort(
      (first, second) =>
        first.position - second.position
    );

    /*
     * O endpoint /items está devolvendo 403 para anúncios
     * de outros vendedores. Por isso importamos diretamente
     * os PRODUCTs de catálogo usando /products/{product_id},
     * que já fornece nome, imagem, permalink e buy_box_winner.
     */
    const catalogProductIds = [
      ...new Set(
        orderedHighlights
          .filter(
            (entry) => entry.type === "PRODUCT"
          )
          .map((entry) => entry.id)
      ),
    ].slice(0, 20);

    if (catalogProductIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "O ranking atual não retornou produtos de catálogo importáveis.",
          details:
            "Os resultados eram ITEM ou USER_PRODUCT, cujos detalhes de terceiros estão bloqueados com erro 403 para esta aplicação.",
          ranking: {
            item: orderedHighlights.filter(
              (entry) => entry.type === "ITEM"
            ).length,
            product: 0,
            userProduct: orderedHighlights.filter(
              (entry) =>
                entry.type === "USER_PRODUCT"
            ).length,
          },
        },
        { status: 404 }
      );
    }

    const catalogResults = await Promise.all(
      catalogProductIds.map((productId) =>
        fetchCatalogProduct(
          productId,
          accessToken
        )
      )
    );

    const products = catalogResults
      .filter(
        (
          product
        ): product is CatalogProduct & {
          id: string;
          name: string;
          permalink: string;
          buy_box_winner: {
            price: number;
          };
        } =>
          Boolean(
            product?.id &&
              product.name &&
              product.permalink &&
              product.buy_box_winner?.price
          )
      )
      .map((product) => {
        const firstPicture =
          product.pictures?.[0]?.secure_url ||
          product.pictures?.[0]?.url ||
          "";

        const imageUrl = firstPicture.replace(
          /^http:/,
          "https:"
        );

        const currentPrice = Number(
          product.buy_box_winner.price
        );

        const originalPriceValue =
          product.buy_box_winner.original_price;

        const originalPrice =
          originalPriceValue !== null &&
          originalPriceValue !== undefined &&
          Number.isFinite(
            Number(originalPriceValue)
          )
            ? Number(originalPriceValue)
            : null;

        return {
          /*
           * Aqui o ml_id será o ID do produto de catálogo,
           * porque o endpoint /items está bloqueado para
           * publicações de terceiros.
           */
          ml_id: product.id,
          name: product.name,
          description:
            product.short_description?.content ||
            null,
          category:
            product.buy_box_winner
              ?.category_id ||
            product.domain_id ||
            "Mercado Livre",
          image_url: imageUrl,
          price: currentPrice,
          old_price:
            originalPrice &&
            originalPrice > currentPrice
              ? originalPrice
              : null,
          affiliate_url: null,
          product_url: product.permalink,
          active: product.status === "active",
          updated_at: new Date().toISOString(),
        };
      })
      .filter(
        (product) =>
          product.image_url &&
          Number.isFinite(product.price) &&
          product.price > 0
      );

    console.log(
      "DIAGNOSTICO_CATALOGO_ML",
      {
        rankingTotal:
          orderedHighlights.length,
        catalogProductIds:
          catalogProductIds.length,
        catalogResponses:
          catalogResults.filter(Boolean).length,
        validProducts: products.length,
      }
    );

    if (products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Os produtos de catálogo foram consultados, mas nenhum tinha todos os dados necessários para cadastro.",
          details:
            "É necessário nome, imagem, preço e permalink.",
        },
        { status: 404 }
      );
    }

    const supabaseAdmin =
      getSupabaseAdmin();

    const {
      data: savedProducts,
      error: saveError,
    } = await supabaseAdmin
      .from("products")
      .upsert(products, {
        onConflict: "ml_id",
        ignoreDuplicates: false,
      })
      .select(
        "id, ml_id, name, price"
      );

    if (saveError) {
      console.error(
        "Erro ao cadastrar produtos de catálogo:",
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
      message: `${
        savedProducts?.length || 0
      } produtos de catálogo foram importados ou atualizados.`,
      imported:
        savedProducts?.length || 0,
      products:
        savedProducts || [],
      skipped: {
        item: orderedHighlights.filter(
          (entry) => entry.type === "ITEM"
        ).length,
        userProduct:
          orderedHighlights.filter(
            (entry) =>
              entry.type === "USER_PRODUCT"
          ).length,
      },
      affiliateLinks:
        "pendentes — a API não gera automaticamente links de afiliado",
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

export async function GET(
  request: NextRequest
) {
  return importProducts(request);
}

export async function POST(
  request: NextRequest
) {
  return importProducts(request);
}