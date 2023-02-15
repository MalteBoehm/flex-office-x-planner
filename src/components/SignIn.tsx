import { signIn, signOut, useSession } from "next-auth/react";

export default function SignIn() {
  const { data: sessionData, status } = useSession();
  return (
    <div>
      <h1>Sign In</h1>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}
