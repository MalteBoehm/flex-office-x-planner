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
  getAttendeancesOfTeam: protectedProcedure
    .input(
      z.object({
        woche: z.number(),
        jahr: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const member = TeamMember.parse(
        await ctx.prisma.teamMember.findFirst({
          where: {
            id: ctx.session.user.id,
          },
        })
      );
      // get all teamMembers by teamId
      const allMembers: TeamMembers = TeamMembers.parse(
        await ctx.prisma.teamMember.findMany({
          where: {
            teamId: member?.teamId,
          },
        })
      );
      // teammbemrs ID is needed to get all attendances
      const teamMemberIds = allMembers.map((member) => member.id);
      // then get all attendances by teamMemberIds and filter by week#
      const attendancesBy = await ctx.prisma.attendance.findMany({
        where: {
          teamMemberId: { in: teamMemberIds },
        },
      });

      const workWeek = attendancesBy.map((attendance) => {
        if (attendance) {
          const anwesenheitPerTag: Anwesenheiten = {
            day: attendance?.day,
            id: attendance?.id,
            teamId: attendance?.teamId ?? "",
            teamMembers: TeamMembers.parse(allMembers),
          };
          console.log("anwesenheitPerTag", anwesenheitPerTag);
          return anwesenheitPerTag;
        }
      });
      console.log("workWeek", workWeek);
      const parsedWeeks = WocheMitAnwesenheiten.parse(
        workWeek.map((workDay) => {
          if (workDay) {
            return workDay;
          }
        })
      );
      console.log("filteredWorkWeek", parsedWeeks);

      const x = parsedWeeks.filter((workDay) => {
        const workDayDate = Anwesenheiten.parse(workDay);
        if (!workDayDate) return false;
        return getWeekNumber(workDayDate.day) === input.woche;
      });
      console.log("x", mapToWorkWeek(x));
      return mapToWorkWeek(x);
    }),
  createAttendance: protectedProcedure
    .input(z.object({ day: z.date() }))
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      console.log("user", user);
      const teamIdOfUser = await ctx.prisma.teamMember.findFirst({
        where: {
          id: user.id,
        },
      });
      console.log(teamIdOfUser?.teamId);
      await ctx.prisma.attendance.create({
        data: {
          day: input.day,
          team: { connect: { id: teamIdOfUser?.teamId } },
          teamMember: { connect: { id: user.id } },
        },
      });
    }),
  removeAttendance: protectedProcedure
    .input(z.object({ dateId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.attendance.delete({
        where: {
          id: input.dateId,
        },
      });
    }),
});

export type TeamMember = z.infer<typeof TeamMember>;
export type TeamMembers = z.infer<typeof TeamMembers>;
export type Anwesenheiten = z.infer<typeof Anwesenheiten>;
export type WocheMitAnwesenheiten = z.infer<typeof WocheMitAnwesenheiten>;
