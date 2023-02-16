import { z } from "zod";
import { addDays, addWeeks, isSameDay, startOfWeek } from "date-fns";

import { mapWochenMitAnwesenheitenToWorkWeek } from "../../../components/Table/Table";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const TeamMember = z.object({
  id: z.string(),
  name: z.string().optional(),
  image: z.string(),
  teamId: z.string(),
});
const TeamMembers = z.array(TeamMember);
const Anwesenheiten = z
  .object({
    id: z.string(),
    day: z.date(),
    teamMembers: z.array(TeamMember).optional(),
    teamId: z.string(),
  })
  .optional();
const WocheMitAnwesenheiten = z.array(Anwesenheiten);

export const anwesenheitenRouter = createTRPCRouter({
  getAnwesenheitenDesTeams: protectedProcedure
    .input(
      z.object({
        woche: z.number(),
        jahr: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      // aktuelles Teammitglied abrufen
      const aktuellesMitglied = TeamMember.parse(
        await ctx.prisma.teamMember.findFirst({
          where: {
            id: ctx.session.user.id,
          },
        })
      );
      // alle Teammitglieder des Teams abrufen
      const alleMitgliederDesTeams: TeamMembers = TeamMembers.parse(
        await ctx.prisma.teamMember.findMany({
          where: {
            teamId: aktuellesMitglied?.teamId,
          },
        })
      );
      // IDs der Teammitglieder benötigt, um Anwesenheiten abzurufen
      const teammitgliederIds = alleMitgliederDesTeams.map(
        (mitglied) => mitglied.id
      );

      // Anwesenheiten im gewünschten Zeitraum abrufen

      // Das Datum des Montags der gewünschten Woche berechnen
      const mondayOfWeek = startOfWeek(new Date(input.jahr, 0, 1), {
        weekStartsOn: 1,
      }); // Montag der ersten Kalenderwoche des Jahres
      const desiredMonday = addWeeks(mondayOfWeek, input.woche); // Montag der gewünschten Kalenderwoche
      const endeDerWoche = addDays(desiredMonday, 4);

      const anwesenheitenEinerWoche = await ctx.prisma.attendance.findMany({
        where: {
          day: {
            gte: desiredMonday,
            lte: endeDerWoche,
          },
          teamMemberId: {
            in: teammitgliederIds,
          },
        },
        include: {
          teamMember: true,
        },
      });

      const anwesenheitenMapFromAnwesenheitenEinerWoche =
        anwesenheitenEinerWoche.map((anwesenheit) => {
          const anwesenheitProTag: Anwesenheiten = {
            day: anwesenheit.day,
            id: anwesenheit.id,
            teamMembers: [],
            teamId: aktuellesMitglied.teamId,
          };

          anwesenheitenEinerWoche.forEach((x) => {
            if (x !== anwesenheit && isSameDay(x.day, anwesenheit.day)) {
              anwesenheitProTag?.teamMembers?.push(
                TeamMember.parse(x.teamMember)
              );
            }
          });

          return anwesenheitProTag;
        });

      const wochenMitAnwesenheiten = WocheMitAnwesenheiten.parse(
        anwesenheitenMapFromAnwesenheitenEinerWoche.map((anwesenheitProTag) => {
          if (anwesenheitProTag) {
            return anwesenheitProTag;
          }
        })
      );
      return mapWochenMitAnwesenheitenToWorkWeek(wochenMitAnwesenheiten);
    }),
  createAnwesenheit: protectedProcedure
    .input(z.object({ tag: z.date() }))
    .mutation(async ({ input, ctx }) => {
      const aktuellerBenutzer = ctx.session.user;
      const teamIdDesBenutzers = await ctx.prisma.teamMember.findFirst({
        where: {
          id: aktuellerBenutzer.id,
        },
      });

      await ctx.prisma.attendance.create({
        data: {
          day: input.tag,
          teamMember: { connect: { id: aktuellerBenutzer.id } },
        },
      });
    }),
  anwesenheitLoeschen: protectedProcedure
    .input(z.object({ anwesenheitId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.attendance.delete({
        where: {
          id: input.anwesenheitId,
        },
      });
    }),
});

export type TeamMember = z.infer<typeof TeamMember>;
export type TeamMembers = z.infer<typeof TeamMembers>;
export type Anwesenheiten = z.infer<typeof Anwesenheiten>;
export type WocheMitAnwesenheiten = z.infer<typeof WocheMitAnwesenheiten>;
