import apiClient from "./apiClient";

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await apiClient.post<{ url: string }>("/uploads/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
};

export default uploadImage;
