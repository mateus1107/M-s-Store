import { supabase } from "@/lib/supabase";

export type NewProduct = {
  name: string;
  price: number;
  image_url: string;
  product_url: string;
  affiliate_url: string;
};

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }

  console.log("PRODUTOS:", data);

  return data ?? [];
}

export async function createProduct(product: NewProduct) {
  const { data, error } = await supabase
    .from("products")
    .insert([
      {
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        product_url: product.product_url,
        affiliate_url: product.affiliate_url,
        active: true,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Erro ao cadastrar produto:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir produto:", error);
    throw new Error(error.message);
  }
}

export async function updateProduct(
  id: string,
  product: Partial<NewProduct>
) {
  const { error } = await supabase
    .from("products")
    .update(product)
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar produto:", error);
    throw new Error(error.message);
  }
}