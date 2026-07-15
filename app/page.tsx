export default function Home() {
  return (
    <main style={{padding: "40px", textAlign: "center"}}>
      <h1 style={{color: "#f4b400"}}>M&A Store</h1>

      <h2>Bem-vindo à nossa loja!</h2>

      <p>Produtos variados com os melhores preços.</p>

      <button
        style={{
          backgroundColor: "#f4b400",
          color: "#000",
          padding: "12px 24px",
          border: "none",
          borderRadius: "8px",
          fontSize: "18px",
          cursor: "pointer"
        }}
      >
        Ver Produtos
      </button>
    </main>
  );
}