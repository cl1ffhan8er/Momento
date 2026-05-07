import { FacebookAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "./auth";

export const signInWithFacebookToken = async (accessToken: string) => {
  const credential = FacebookAuthProvider.credential(accessToken);
  return signInWithCredential(auth, credential);
};
