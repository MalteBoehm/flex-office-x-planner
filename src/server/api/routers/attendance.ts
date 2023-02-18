import { z } from "zod";
import {
  addDays,
  addMilliseconds,
  addWeeks,
  format,
  isSameDay,
  startOfWeek,
} from "date-fns";

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
      const aktuellesMitglied = TeamMember.parse(
        await ctx.prisma.teamMember.findFirst({
          where: {
            id: ctx.session.user.id,
          },
        })
      );

      const alleMitgliederDesTeams: TeamMembers = TeamMembers.parse(
        await ctx.prisma.teamMember.findMany({
          where: {
            teamId: aktuellesMitglied?.teamId,
          },
        })
      );

      const teammitgliederIds = alleMitgliederDesTeams.map(
        (mitglied) => mitglied.id
      );

      const timeZone = "Europe/Berlin"; // Replace with your desired timezone

      const mondayOfWeek = startOfWeek(new Date(Date.UTC(input.jahr, 0, 1)), {
        weekStartsOn: 1,
      }); // Monday of the first calendar week of the year
      const desiredMonday = addWeeks(mondayOfWeek, input.woche); // Monday of the desired calendar week

      // Adjust the date by the timezone offset
      const adjustedMonday = addMilliseconds(
        desiredMonday,
        getTimezoneOffsetInMilliseconds(desiredMonday, timeZone)
      );
      const formattedAdjustedMonday = format(
        adjustedMonday,
        "yyyy-MM-dd HH:mm:ss"
      );
      const endeDerWoche = addDays(adjustedMonday, 5);
      const formattedAdjustedEndOfWeek = format(
        endeDerWoche,
        "yyyy-MM-dd HH:mm:ss"
      );
      // console.log(adjustedMonday.toISOString());
      // console.log(endeDerWoche.toISOString());
      const anwesenheitenEinerWoche = await ctx.prisma.attendance.findMany({
        where: {
          day: {
            gte: new Date(adjustedMonday),
            lte: new Date(endeDerWoche),
          },
          teamMemberId: {
            in: teammitgliederIds,
          },
        },
        include: {
          teamMember: true,
        },
      });
      console.log(anwesenheitenEinerWoche);
      const anwesenheitenMapFromAnwesenheitenEinerWoche =
        anwesenheitenEinerWoche.map((anwesenheit) => {
          const anwesenheitProTag: Anwesenheiten = {
            // Convert date to UTC string
            day: new Date(anwesenheit.day.toISOString()),
            id: anwesenheit.id,
            teamMembers: [TeamMember.parse(anwesenheit.teamMember)],
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
      return mapWochenMitAnwesenheitenToWorkWeek(
        anwesenheitenMapFromAnwesenheitenEinerWoche
      );
    }),
  createAnwesenheit: protectedProcedure
    .input(z.object({ tag: z.string().datetime() }))
    .mutation(async ({ input, ctx }) => {
      const aktuellerBenutzer = ctx.session.user;
      const anwesenheitExistiert = await ctx.prisma.attendance.findFirst({
        where: {
          day: new Date(input.tag),
          teamMemberId: aktuellerBenutzer.id,
        },
      });

      if (!anwesenheitExistiert) {
        await ctx.prisma.attendance.create({
          data: {
            day: input.tag,
            teamMemberId: aktuellerBenutzer.id,
          },
        });
      }
    }),
  anwesenheitLoeschen: protectedProcedure
    .input(z.object({ anwesenheitId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const isUserAttendence = await ctx.prisma.attendance.findFirst({
        where: {
          id: input.anwesenheitId,
        },
      });
      if (isUserAttendence?.teamMemberId === ctx.session.user.id) {
        await ctx.prisma.attendance.delete({
          where: {
            id: input.anwesenheitId,
          },
        });
      }
    }),
});

export type TeamMember = z.infer<typeof TeamMember>;
export type TeamMembers = z.infer<typeof TeamMembers>;
export type Anwesenheiten = z.infer<typeof Anwesenheiten>;
export type WocheMitAnwesenheiten = z.infer<typeof WocheMitAnwesenheiten>;

function getTimezoneOffsetInMilliseconds(date: Date, timeZone: string) {
  const dateWithTimeZone = new Date(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    }).format(date)
  );

  return dateWithTimeZone.getTimezoneOffset() * 60000;
}
