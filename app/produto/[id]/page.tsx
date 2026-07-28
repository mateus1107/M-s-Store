import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";

export default function ProductPage() {
  return (
    <main className="max-w-6xl mx-auto p-8">

      <Link
        href="/"
        className="text-blue-600 hover:underline"
      >
        ← Voltar para a loja
      </Link>

      <div className="grid md:grid-cols-2 gap-10 mt-8">

        <img
          src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop"
          alt="Smartphone Samsung"
          className="w-full rounded-xl shadow-lg"
        />

        <div>

          <h1 className="text-4xl font-bold">
            Smartphone Samsung
          </h1>

          <div className="flex gap-1 text-yellow-400 mt-3">
            <Star fill="currentColor" />
            <Star fill="currentColor" />
            <Star fill="currentColor" />
            <Star fill="currentColor" />
            <Star fill="currentColor" />
          </div>

          <p className="text-gray-600 mt-6">
            Smartphone moderno, com excelente desempenho, câmera de alta qualidade
            e bateria de longa duração.
          </p>

          <p className="text-4xl font-bold text-green-600 mt-8">
            R$ 1.899,90
          </p>

          <a
            href="https://www.mercadolivre.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-8 bg-yellow-400 hover:bg-yellow-500 px-8 py-4 rounded-xl font-bold"
          >
            <ShoppingCart size={22} />
            Comprar no Mercado Livre
          </a>

        </div>

      </div>

    </main>
  );
}