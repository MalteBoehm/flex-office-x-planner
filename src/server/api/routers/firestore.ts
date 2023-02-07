import { randomUUID } from "crypto";
import { addDoc, collection, getDocs } from "firebase/firestore/lite";
import { z } from "zod";
import { db } from "../../../firebase";
import { createTRPCRouter, publicProcedure } from "../trpc";
const Arbeitswoche = z.object({
  id: z.string(),
  kalenderwoche: z.number(),
  montagBesucherIds: z.array(z.string().optional()),
  dienstagBesucherIds: z.array(z.string().optional()),
  mittwochBesucherIds: z.array(z.string().optional()),
  donnerstagBesucherIds: z.array(z.string().optional()),
  freitagBesucherIds: z.array(z.string().optional()),
});
const Arbeitswochen = z.array(Arbeitswoche.optional());
type Arbeitswochen = z.infer<typeof Arbeitswochen>;
type Arbeitswoche = z.infer<typeof Arbeitswoche>;

export const fireStoreRouter = createTRPCRouter({
  getWeek: publicProcedure.query(async () => {
    const week = collection(db, "week");
    const weeksSnapshot = await getDocs(week);
    const daysList = weeksSnapshot.docs.map((doc) => doc.data());
    return Arbeitswochen.parse(daysList);
  }),
  createTable: publicProcedure.mutation(async () => {
    const week = collection(db, "week");
    const weeksSnapshot = await getDocs(week);

    const date = new Date();
    const currentWeek = 6;
    const newWeek: Arbeitswoche = {
      id: randomUUID(),
      montagBesucherIds: [],
      dienstagBesucherIds: [],
      mittwochBesucherIds: [],
      donnerstagBesucherIds: [],
      freitagBesucherIds: [],

      kalenderwoche: currentWeek,
    };
    await addDoc(week, newWeek);
  }),
});
