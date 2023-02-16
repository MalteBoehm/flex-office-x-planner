import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const PresentTeamMember = z
  .object({
    id: z.string(),
    tagesId: z.string().optional(),
    day: z.date(),
    name: z.string().optional(),
    teamId: z.string().optional(),
    email: z.string().optional(),
    image: z.string().optional(),
  })
  .optional();

export const teamMemberRouter = createTRPCRouter({
  isTeamMember: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const teamMember = await ctx.prisma.teamMember.findFirst({
      where: {
        id: userId,
      },
    });
    // console.log("teamMember", teamMember);
    return !!teamMember?.teamId;
  }),
  getUsersTeamName: protectedProcedure.query(async ({ ctx }) => {
    const nutzer = await ctx.prisma.teamMember.findFirst({
      where: { id: ctx.session.user.id },
    });
    if (nutzer) {
      const nutzerTeam = await ctx.prisma.team.findFirst({
        where: { id: nutzer.teamId },
      });

      console.log("nutzerTeam", nutzerTeam);
      if (!nutzerTeam) {
        return "Kein Team";
      } else {
        return nutzerTeam.name;
      }
    }
  }),
});

export type PresentTeamMember = z.infer<typeof PresentTeamMember>;
