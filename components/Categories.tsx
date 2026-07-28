const categories = [
  {
    name: "Eletrônicos",
    icon: "📱",
  },
  {
    name: "Casa",
    icon: "🏠",
  },
  {
    name: "Moda",
    icon: "👕",
  },
  {
    name: "Ferramentas",
    icon: "🛠️",
  },
  {
    name: "Games",
    icon: "🎮",
  },
  {
    name: "Ofertas",
    icon: "🔥",
  },
];

export default function Categories() {
  return (
    <section className="max-w-7xl mx-auto py-12">

      <h2 className="text-3xl font-bold mb-8">
        Categorias
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-5">

        {categories.map((category) => (
          <div
            key={category.name}
            className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition cursor-pointer"
          >

            <div className="text-4xl">
              {category.icon}
            </div>

            <h3 className="font-bold mt-3">
              {category.name}
            </h3>

          </div>
        ))}

      </div>

    </section>
  );
}