import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";

import Image from "next/image";
import SignIn from "../components/SignIn";
import Table from "../components/Table/Table";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Flex Office Planner</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#70c917] to-[#4be36e]">
        <AuthShowcase />
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();
  if (!sessionData) return <SignIn />;
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 bg-amber-400">
      <p className="text-center text-2xl text-white">
        {sessionData && sessionData.user.image && (
          <Image
            alt={sessionData.user.name ?? ""}
            src={sessionData.user.image}
            width={200}
            height={200}
            className="mr-2 h-10 w-10 rounded-full"
          />
        )}
      </p>
      {sessionData && <Table />}
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
