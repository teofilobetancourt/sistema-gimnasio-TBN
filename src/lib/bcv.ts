import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const fetchBCVRate = async () => {
  try {
    const response = await fetch("https://ve.dolarapi.com/v1/dolares/oficial");
    if (!response.ok) throw new Error("Error fetching BCV rate");
    const data = await response.json();
    return Number(data.promedio).toFixed(2);
  } catch (error) {
    console.error("BCV Fetch Error:", error);
    return null;
  }
};

export const syncBCVRate = async () => {
  const newRate = await fetchBCVRate();
  if (newRate) {
    const docRef = doc(db, "ajustes", "general");
    await setDoc(docRef, {
      tasaBCV: newRate,
      ultimaActualizacionBCV: serverTimestamp(),
      autoBCV: true,
    }, { merge: true });
    return newRate;
  }
  return null;
};
