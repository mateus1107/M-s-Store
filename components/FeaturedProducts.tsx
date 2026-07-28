import ProductCard from "./ProductCard";

const products = [
  {
    name: "Smartphone Samsung",
    price: "R$ 1.899,90",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop",
    link: "https://www.mercadolivre.com.br",
  },
  {
    name: "Notebook Lenovo",
    price: "R$ 3.499,90",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop",
    link: "https://www.mercadolivre.com.br",
  },
  {
    name: "Smart TV 50''",
    price: "R$ 2.299,90",
    image:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop",
    link: "https://www.mercadolivre.com.br",
  },
  {
    name: "Fone Bluetooth",
    price: "R$ 199,90",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
    link: "https://www.mercadolivre.com.br",
  },
  {
    name: "Air Fryer",
    price: "R$ 349,90",
    image:
      "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop",
    link: "https://www.mercadolivre.com.br",
  },
  {
    name: "Cafeteira",
    price: "R$ 249,90",
    image:
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop",
    link: "https://www.mercadolivre.com.br",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="max-w-7xl mx-auto py-12 px-6">

      <h2 className="text-3xl font-bold mb-8">
        🔥 Produtos em Destaque
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {products.map((product, index) => (
          <ProductCard
            key={index}
            name={product.name}
            price={product.price}
            image={product.image}
            link={product.link}
          />
        ))}

      </div>

    </section>
  );
}