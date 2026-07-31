import ProductCard from "./ProductCard";
import { getProducts } from "@/app/services/products";

export default async function FeaturedProducts() {
  const products = await getProducts();

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h2 className="mb-8 text-3xl font-bold">
        🔥 Produtos em Destaque
      </h2>

      {products.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-gray-700">
            Nenhum produto cadastrado ainda.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Os produtos adicionados no Supabase aparecerão aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={Number(product.price ?? 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
              image={product.image_url ?? ""}
              link={product.affiliate_url}
            />
          ))}
        </div>
      )}
    </section>
  );
}