import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";

import Image from "next/image";
import SignIn from "../components/SignIn";
import Table from "../components/Table/Table";
import TeamsSettingsView from "../components/TeamSettings/TeamsSettingsView";
import { useState } from "react";

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
  const [settingsOffen, setSettingsOffen] = useState(false);
  if (!sessionData) return <SignIn />;
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 bg-amber-400 text-center">
      <p className="justify-center self-center text-center text-2xl text-white">
        Hallo {sessionData.user.name}
      </p>
      {sessionData && sessionData.user.image && (
        <span>
          <Image
            alt={sessionData.user.name ?? ""}
            src={sessionData.user.image}
            width={200}
            height={200}
            className="mr-2 h-10 w-10 rounded-full"
          />
        </span>
      )}
      {sessionData && (
        <p
          onClick={() => setSettingsOffen(!settingsOffen)}
          className="text-lg underline"
        >
          ⚙️Settings{" "}
        </p>
      )}
      {settingsOffen && <TeamsSettingsView />}
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
