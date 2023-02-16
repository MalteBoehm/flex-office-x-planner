import { anwesenheitenRouter } from "./routers/attendance";
import { teamsRouter } from "./routers/team";
import { teamMemberRouter } from "./routers/teamMember";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */

export const appRouter = createTRPCRouter({
  teamMember: teamMemberRouter,
  anwesenheiten: anwesenheitenRouter,
  teams: teamsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
