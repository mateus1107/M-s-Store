export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-orange-300 py-20">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 items-center gap-12">

        <div>
          <span className="inline-block bg-black text-yellow-400 px-4 py-2 rounded-full font-bold">
            🔥 OFERTAS IMPERDÍVEIS
          </span>

          <h1 className="text-5xl md:text-6xl font-extrabold text-black mt-6 leading-tight">
            Tudo o que você procura,
            <br />
            pelos melhores preços.
          </h1>

          <p className="text-lg text-gray-800 mt-6 max-w-xl">
            Produtos selecionados, ofertas exclusivas, entrega rápida e
            compras seguras. Aproveite as promoções da M&S Store.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <button className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-900 transition">
              🛍️ Ver Ofertas
            </button>

            <button className="border-2 border-black px-8 py-4 rounded-xl font-bold hover:bg-black hover:text-white transition">
              ⭐ Mais Vendidos
            </button>
          </div>

          <div className="flex flex-wrap gap-8 mt-10 text-sm font-semibold">
            <span>🚚 Frete Grátis</span>
            <span>💳 Parcelamento em até 12x</span>
            <span>🔒 Compra Segura</span>
          </div>
        </div>

        <div className="flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=900&auto=format&fit=crop"
            alt="Compras Online"
            className="rounded-3xl shadow-2xl w-full max-w-xl"
          />
        </div>

      </div>
    </section>
  );
}