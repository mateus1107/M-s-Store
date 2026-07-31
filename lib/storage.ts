import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function uploadProductImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem válido.");
  }

  const maximumSize = 5 * 1024 * 1024;

  if (file.size > maximumSize) {
    throw new Error("A imagem deve ter no máximo 5 MB.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${uuidv4()}.${extension}`;
  const filePath = `uploads/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("products")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("Erro no upload da imagem:", uploadError);
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from("products")
    .getPublicUrl(filePath);

  if (!data.publicUrl) {
    throw new Error("Não foi possível gerar a URL pública da imagem.");
  }

  return data.publicUrl;
}