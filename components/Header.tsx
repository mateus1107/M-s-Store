import {
  Heart,
  Menu,
  Search,
  ShoppingCart,
  User,
} from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-yellow-500 bg-yellow-400 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <a
          href="/"
          className="flex shrink-0 items-center gap-2 text-2xl font-extrabold text-black md:text-3xl"
        >
          <span className="text-3xl">🛍️</span>
          <span>M&S Store</span>
        </a>

        <div className="hidden flex-1 md:block">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="text"
              placeholder="Pesquisar produtos, marcas e categorias..."
              className="w-full rounded-xl border border-yellow-600 bg-white py-3 pl-12 pr-4 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
            />
          </div>
        </div>

        <nav className="hidden items-center gap-5 lg:flex">
          <a
            href="#categorias"
            className="text-sm font-semibold text-black transition hover:opacity-70"
          >
            Categorias
          </a>

          <a
            href="#produtos"
            className="text-sm font-semibold text-black transition hover:opacity-70"
          >
            Ofertas
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Favoritos"
            className="hidden rounded-xl p-3 transition hover:bg-yellow-300 sm:block"
          >
            <Heart size={22} />
          </button>

          <button
            type="button"
            aria-label="Minha conta"
            className="hidden rounded-xl p-3 transition hover:bg-yellow-300 sm:block"
          >
            <User size={22} />
          </button>

          <button
            type="button"
            aria-label="Carrinho"
            className="relative rounded-xl p-3 transition hover:bg-yellow-300"
          >
            <ShoppingCart size={23} />

            <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs font-bold text-yellow-400">
              0
            </span>
          </button>

          <button
            type="button"
            aria-label="Abrir menu"
            className="rounded-xl p-3 transition hover:bg-yellow-300 lg:hidden"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="text"
            placeholder="Pesquisar produtos..."
            className="w-full rounded-xl border border-yellow-600 bg-white py-3 pl-11 pr-4 text-sm outline-none"
          />
        </div>
      </div>
    </header>
  );
}