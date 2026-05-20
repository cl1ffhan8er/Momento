import { storage } from "@/src/lib/storage";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export const uploadFile = async (
  uri: string,
  path: string
): Promise<string> => {
  const filename = uri.split("/").pop() ?? `${Date.now()}.jpg`;
  const storageRef = ref(storage, `${path}/${Date.now()}_${filename}`);

  const response = await fetch(uri);
  const blob = await response.blob();
  await uploadBytes(storageRef, blob);

  return getDownloadURL(storageRef);
};
