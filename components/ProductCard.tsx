import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
  CreditCard,
  PackageCheck,
} from "lucide-react";

interface ProductCardProps {
  name: string;
  price: string;
  image: string;
  link: string;
}

export default function ProductCard({
  name,
  price,
  image,
  link,
}: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow">
          -35%
        </span>

        <button
          type="button"
          aria-label={`Favoritar ${name}`}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-red-50 hover:text-red-500"
        >
          <Heart size={20} />
        </button>
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex text-yellow-400">
            <Star size={17} fill="currentColor" />
            <Star size={17} fill="currentColor" />
            <Star size={17} fill="currentColor" />
            <Star size={17} fill="currentColor" />
            <Star size={17} fill="currentColor" />
          </div>

          <span className="text-sm text-gray-500">4,9 (2.384)</span>
        </div>

        <h3 className="min-h-14 text-lg font-bold leading-snug text-gray-900">
          {name}
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Produto selecionado com ótima qualidade.
        </p>

        <div className="mt-4">
          <p className="text-sm text-gray-400 line-through">R$ 2.499,90</p>

          <p className="text-2xl font-extrabold text-green-600">{price}</p>

          <p className="mt-1 text-sm text-gray-600">
            ou 12x sem juros
          </p>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 font-semibold text-green-600">
            <Truck size={18} />
            Frete grátis
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <CreditCard size={18} />
            Parcelamento disponível
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <PackageCheck size={18} />
            Entrega rápida
          </div>
        </div>

        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 py-3 font-bold text-black transition hover:bg-yellow-500"
        >
          <ShoppingCart size={20} />
          Comprar Agora
        </a>
      </div>
    </article>
  );
}
