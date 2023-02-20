import type { GetServerSidePropsContext } from "next";
import { type DefaultSession, getServerSession, type NextAuthOptions } from "next-auth"; // import EmailProvider from "next-auth/providers/email";
// import GitHubProvider from "next-auth/providers/github";
// import GoogleProvider from "next-auth/providers/google";
// import { env } from "../env.mjs";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";
import { firebaseConfig } from "../firebase";

/**
 * Module augmentation for `next-auth` types.
 * Allows us to add custom properties to the `session` object and keep type
 * safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks,
 * etc.
 *
 * @see https://next-auth.js.org/configuration/options
 **/
export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // session.user.role = user.role; <-- put other properties on the session here
      }
      return session;
    },
  },

  adapter: FirestoreAdapter(firebaseConfig),

  providers: [
    // GoogleProvider({
    //   clientId: env.GOOGLE_ID,
    //   clientSecret: env.GOOGLE_SECRET,
    // }),
    // GitHubProvider({
    //   clientId: env.GITHUB_ID,
    //   clientSecret: env.GITHUB_SECRET,
    // }),
    // EmailProvider({
    //   server: {
    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    //     host: env.EMAIL_SERVER_HOST,
    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    //     port: env.EMAIL_SERVER_PORT,
    //     auth: {
    //       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    //       user: env.EMAIL_SERVER_USER,
    //       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    //       pass: env.EMAIL_SERVER_PASSWORD,
    //     },
    //   },
    //   from: process.env.EMAIL_FROM,
    // }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the
 * `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 **/
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
