import { addDoc, collection, getDocs } from "firebase/firestore/lite";
import { z } from "zod";
import { db } from "../../../firebase";
import { createTRPCRouter, protectedProcedure } from "../trpc";
const User = z.object({
  email: z.string(),
  image: z.string(),
  name: z.string(),
});

const Users = z.array(User);

const Arbeitswoche = z.object({
  montagBesucherIds: z.array(z.string().optional()),
  dienstagBesucherIds: z.array(z.string().optional()),
  mittwochBesucherIds: z.array(z.string().optional()),
  donnerstagBesucherIds: z.array(z.string().optional()),
  freitagBesucherIds: z.array(z.string().optional()),
});

const Arbeitswochen = z.array(Arbeitswoche);
export type Arbeitswochen = z.infer<typeof Arbeitswochen>;
export type Arbeitswoche = z.infer<typeof Arbeitswoche>;
export type User = z.infer<typeof User>;
export type Users = z.infer<typeof Users>;

export const fireStoreRouter = createTRPCRouter({
  getWeek: protectedProcedure.query(async () => {
    const week = collection(db, "week");
    const weeksSnapshot = await getDocs(week);
    const daysList = weeksSnapshot.docs.map((doc) => doc.data());
    return Arbeitswochen.parse(daysList);
  }),
  getUserName: protectedProcedure
    .input(z.object({ userIds: z.array(z.string()) }))
    .query(async ({ input }) => {
      const userData: Users = [];
      // console.log(input.userId);

      console.log(input.userIds.length);
      const querySnapshot = await getDocs(collection(db, "users"));

      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots

        input.userIds.forEach((id) => {
          userData.push(User.parse(doc.data()));
        });
      });

      console.log(userData);
      return Array(...new Set(userData));
    }),

  addToDay: protectedProcedure
    .input(z.object({ userId: z.string(), keyOfDay: z.string() }))
    .mutation(async () => {
      // input Montag , BesucherId
      const week = collection(db, "week");

      const weeksSnapshot = await getDocs(week);
      if (weeksSnapshot.empty) {
        const newWeek: Arbeitswoche = {
          montagBesucherIds: [],
          dienstagBesucherIds: [],
          mittwochBesucherIds: [],
          donnerstagBesucherIds: [],
          freitagBesucherIds: [],
        };
        await addDoc(week, newWeek);
      }

      // prima ist ja angelegt
      const arbeitswoche: Arbeitswoche = Arbeitswoche.parse(
        weeksSnapshot.docs.at(0)!.data()
      );
      console.log(arbeitswoche);
      // wenn liste von woche leer, dann anlegen
      // wenn liste von woche nicht leer, dann hinzufügen
    }),
});
