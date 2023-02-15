import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const CreateTeam = z
  .object({
    name: z.string(),
  })
  .refine((data) => data.name.length > 3, {
    message: "Name must be longer than 3 characters",
  });
export type CreateTeam = z.infer<typeof CreateTeam>;
export const teamsRouter = createTRPCRouter({
  createTeam: protectedProcedure
    .input(CreateTeam)
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;

      const findMember = await ctx.prisma.teamMember.findFirst({
        where: { id: user.id },
      });
      const teamAlreadyExists = await ctx.prisma.team.findFirst({
        where: { name: input.name },
      });

      if (!findMember && !teamAlreadyExists) {
        return await ctx.prisma.teamMember.create({
          data: {
            team: {
              create: { name: input.name },
            },
            id: ctx.session.user.id,
            name: user?.name ?? "Unbekannt",
            image: user?.image ?? "",
            email: user?.email ?? "",
          },
        });
      }
      console.log("team already exists", teamAlreadyExists);
      if (!teamAlreadyExists) {
        console.log("team already exists");
        return await ctx.prisma.team.create({
          data: {
            name: input.name,
            members: { connect: { id: user.id } },
          },
        });
      }
    }),
  getTeam: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.team.findMany();
  }),
  switchTeam: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      // remover userId from current Team
      // add userId to new Team
      const member = await ctx.prisma.teamMember.update({
        where: { id: ctx.session.user.id },
        select: { teamId: true },
        data: { teamId: input },
      });
      console.log("member", member);
    }),
  deleteTeam: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      // await ctx.prisma.team.deleteMany({});
      // await ctx.prisma.teamMember.deleteMany({});
      // await ctx.prisma.attendance.deleteMany({});
      const isUserInTeam = await ctx.prisma.teamMember.findFirst({
        where: { teamId: input },
      });
      if (!isUserInTeam) {
        await ctx.prisma.team.delete({
          where: { id: input },
        });
      }
    }),
});
