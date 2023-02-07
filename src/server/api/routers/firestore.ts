import { collection, getDocs } from "firebase/firestore/lite";
import { db } from "../../../firebase";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const fireStoreRouter = createTRPCRouter({
  getWeek: publicProcedure.query(async () => {
    const week = collection(db, "week");
    const weeksSnapshot = await getDocs(week);
    const daysList = weeksSnapshot.docs.map((doc) => doc.data());
    return daysList;
  }),
});
