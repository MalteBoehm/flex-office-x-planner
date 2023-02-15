import { z } from "zod";
import { mapToWorkWeek } from "../../../components/Table/Table";
import { getWeekNumber } from "../../../utils/getWeek";
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
// await ctx.prisma.attendance.deleteMany({});
// await ctx.prisma.team.deleteMany({});
// await ctx.prisma.teamMember.deleteMany({});

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
      // alle Anwesenheiten nach den IDs der Teammitglieder abrufen und nach Kalenderwoche filtern
      const anwesenheiten = await ctx.prisma.attendance.findMany({
        where: {
          teamMemberId: { in: teammitgliederIds },
        },
      });

      // Anwesenheiten in Wochen- und Tag-Struktur umwandeln
      const anwesenheitenProTag = anwesenheiten.map((anwesenheit) => {
        if (anwesenheit) {
          const anwesenheitProTag: Anwesenheiten = {
            day: anwesenheit?.day,
            id: anwesenheit?.id,
            teamId: anwesenheit?.teamId ?? "",
            teamMembers: TeamMembers.parse(alleMitgliederDesTeams),
          };
          return anwesenheitProTag;
        }
      });
      const wochenMitAnwesenheiten = WocheMitAnwesenheiten.parse(
        anwesenheitenProTag.map((anwesenheitProTag) => {
          if (anwesenheitProTag) {
            return anwesenheitProTag;
          }
        })
      );

      // Anwesenheiten nach Kalenderwoche filtern und in Wochen-Tag-Struktur umwandeln
      const anwesenheitenInGewuenschterWoche = wochenMitAnwesenheiten.filter(
        (anwesenheitProTag) => {
          const tagMitAnwesenheit = Anwesenheiten.parse(anwesenheitProTag);
          if (!tagMitAnwesenheit) return false;
          return getWeekNumber(tagMitAnwesenheit.day) === input.woche;
        }
      );
      return mapToWorkWeek(anwesenheitenInGewuenschterWoche);
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
          team: { connect: { id: teamIdDesBenutzers?.teamId } },
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
