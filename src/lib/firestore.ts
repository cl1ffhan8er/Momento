console.log("FIRESTORE LOADING");
import { getFirestore } from "firebase/firestore";
import { app } from "./config";

export const db = getFirestore(app);
