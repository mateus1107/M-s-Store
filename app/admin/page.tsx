"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";

import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../services/products";

import { uploadProductImage } from "../../lib/storage";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  product_url: string;
  affiliate_url: string;
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState("");

  function convertPriceToNumber(value: string): number {
    const cleanedValue = value.trim().replace(/\s/g, "");

    if (cleanedValue.includes(",") && cleanedValue.includes(".")) {
      return Number(
        cleanedValue.replace(/\./g, "").replace(",", ".")
      );
    }

    if (cleanedValue.includes(",")) {
      return Number(cleanedValue.replace(",", "."));
    }

    return Number(cleanedValue);
  }

  async function loadProducts() {
    try {
      const data = await getProducts();
      setProducts(data as Product[]);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      setMessage("Não foi possível carregar os produtos.");
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  function clearForm() {
    setName("");
    setPrice("");
    setImageUrl("");
    setProductUrl("");
    setAffiliateUrl("");

    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Selecione um arquivo de imagem válido.");
      return;
    }

    const maximumSize = 5 * 1024 * 1024;

    if (file.size > maximumSize) {
      setMessage("A imagem deve ter no máximo 5 MB.");
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(previewUrl);
    setMessage("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Digite o nome do produto.");
      return;
    }

    if (!price.trim()) {
      setMessage("Digite o preço do produto.");
      return;
    }

    if (!productUrl.trim()) {
      setMessage("Digite o link do Mercado Livre.");
      return;
    }

    if (!affiliateUrl.trim()) {
      setMessage("Digite o link de afiliado.");
      return;
    }

    if (!editingId && !imageFile) {
      setMessage("Selecione uma imagem para o produto.");
      return;
    }

    const numericPrice = convertPriceToNumber(price);

    if (
      Number.isNaN(numericPrice) ||
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      setMessage("Digite um preço válido.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      let finalImageUrl = imageUrl;

      if (imageFile) {
        setUploadingImage(true);

        finalImageUrl = await uploadProductImage(imageFile);

        setUploadingImage(false);
      }

      if (!finalImageUrl) {
        setMessage("Não foi possível obter a imagem do produto.");
        return;
      }

      const productData = {
        name: name.trim(),
        price: numericPrice,
        image_url: finalImageUrl,
        product_url: productUrl.trim(),
        affiliate_url: affiliateUrl.trim(),
      };

      if (editingId) {
        await updateProduct(editingId, productData);
        setMessage("Produto atualizado com sucesso!");
      } else {
        await createProduct(productData);
        setMessage("Produto cadastrado com sucesso!");
      }

      clearForm();
      await loadProducts();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o produto."
      );
    } finally {
      setUploadingImage(false);
      setLoading(false);
    }
  }

  function handleEdit(product: Product) {
    setEditingId(product.id);

    setName(product.name);
    setPrice(String(product.price).replace(".", ","));
    setImageUrl(product.image_url);
    setImagePreview(product.image_url);
    setProductUrl(product.product_url);
    setAffiliateUrl(product.affiliate_url);

    setImageFile(null);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este produto?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await deleteProduct(id);

      setMessage("Produto excluído com sucesso!");
      await loadProducts();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o produto."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold text-yellow-500 md:text-4xl">
          Painel Administrativo
        </h1>

        <section className="mb-10 rounded-xl bg-white p-5 shadow-lg md:p-8">
          <h2 className="mb-6 text-2xl font-semibold">
            {editingId ? "Editar Produto" : "Adicionar Produto"}
          </h2>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <input
              type="text"
              className="rounded-lg border p-3"
              placeholder="Nome do produto"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <input
              type="text"
              className="rounded-lg border p-3"
              placeholder="Preço — exemplo: 2999,90"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              inputMode="decimal"
            />

            <div className="rounded-lg border border-dashed p-4">
              <label className="mb-2 block font-semibold">
                Imagem do produto
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full"
              />

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Pré-visualização do produto"
                  className="mt-4 h-52 w-full rounded-lg border object-contain"
                />
              )}

              <p className="mt-2 text-sm text-gray-500">
                Formatos de imagem. Tamanho máximo: 5 MB.
              </p>
            </div>

            <input
              type="url"
              className="rounded-lg border p-3"
              placeholder="Link do Mercado Livre"
              value={productUrl}
              onChange={(event) =>
                setProductUrl(event.target.value)
              }
            />

            <input
              type="url"
              className="rounded-lg border p-3"
              placeholder="Link de afiliado"
              value={affiliateUrl}
              onChange={(event) =>
                setAffiliateUrl(event.target.value)
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-yellow-400 p-3 font-bold hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploadingImage
                ? "Enviando imagem..."
                : loading
                  ? "Salvando..."
                  : editingId
                    ? "Salvar alterações"
                    : "Adicionar produto"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={clearForm}
                disabled={loading}
                className="rounded-lg border p-3 font-bold disabled:opacity-60"
              >
                Cancelar edição
              </button>
            )}

            {message && (
              <p className="text-center font-semibold">
                {message}
              </p>
            )}
          </form>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-lg md:p-8">
          <h2 className="mb-6 text-2xl font-semibold">
            Produtos cadastrados
          </h2>

          {products.length === 0 ? (
            <p>Nenhum produto cadastrado.</p>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-20 w-20 rounded-lg border object-cover"
                    />

                    <div>
                      <h3 className="text-lg font-bold">
                        {product.name}
                      </h3>

                      <p className="text-green-600">
                        {Number(product.price).toLocaleString(
                          "pt-BR",
                          {
                            style: "currency",
                            currency: "BRL",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                      disabled={loading}
                      className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white disabled:opacity-60"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      disabled={loading}
                      className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white disabled:opacity-60"
                    >
                      Excluir
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}